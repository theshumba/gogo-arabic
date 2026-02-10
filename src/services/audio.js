import { Howl, Howler } from 'howler';

/**
 * Simple LRU cache implementation for managing Howl instances.
 * Automatically unloads oldest entries when cache exceeds max size.
 */
class LRUCache {
  constructor(maxSize = 50) {
    this.maxSize = maxSize;
    this.cache = new Map(); // key -> { howl, lastUsed }
  }

  get(key) {
    const entry = this.cache.get(key);
    if (entry) {
      entry.lastUsed = Date.now();
      return entry.howl;
    }
    return null;
  }

  set(key, howl) {
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      let oldestKey = null;
      let oldestTime = Infinity;

      for (const [k, v] of this.cache.entries()) {
        if (v.lastUsed < oldestTime) {
          oldestTime = v.lastUsed;
          oldestKey = k;
        }
      }

      if (oldestKey) {
        const oldEntry = this.cache.get(oldestKey);
        oldEntry.howl.unload();
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, { howl, lastUsed: Date.now() });
  }

  clear() {
    for (const [, entry] of this.cache.entries()) {
      entry.howl.unload();
    }
    this.cache.clear();
  }
}

/**
 * AudioManager singleton
 * Five independent volume channels: master, ambient, bgm, sfx, pronunciation
 * Master volume scales all other channels.
 * Effective volume = channelVolume * masterVolume
 */
class AudioManager {
  constructor() {
    /** @type {Howl|null} Currently playing ambient Howl */
    this.ambient = null;
    /** @type {string|null} Current ambient zone name for dedup */
    this.ambientZone = null;

    /** @type {Howl|null} Currently playing BGM Howl */
    this.bgm = null;
    /** @type {string|null} Current BGM track name for dedup */
    this.bgmTrack = null;
    /** @type {boolean} Whether BGM was paused (for resume) */
    this.bgmWasPaused = false;

    // Master volume (0-1 internal range) — scales all channels
    this.masterVolume = 0.7;

    // Channel volumes (0-1 internal range)
    this.ambientVolume = 0.7;
    this.bgmVolume = 0.7;
    this.sfxVolume = 0.8;
    this.pronunciationVolume = 1.0;

    // Mute state
    this.isMuted = false;

    /** @type {Object<string, Howl>} Cached SFX Howl objects keyed by name */
    this.sfxCache = {};

    /** @type {LRUCache} LRU cache for word pronunciations (prevents memory leak) */
    this.wordCache = new LRUCache(50);

    /** @type {LRUCache} LRU cache for letter pronunciations */
    this.letterCache = new LRUCache(28);
  }

  // ---------------------------------------------------------------------------
  // Master Volume & Mute
  // ---------------------------------------------------------------------------

  /**
   * Set master volume. Scales all channel outputs.
   * @param {number} vol - Volume from 0 to 100
   */
  setMasterVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol / 100));
    // Update all currently playing Howl volumes
    if (this.ambient) {
      this.ambient.volume(this.ambientVolume * this.masterVolume);
    }
    if (this.bgm) {
      this.bgm.volume(this.bgmVolume * this.masterVolume);
    }
  }

  /**
   * Mute all audio globally via Howler.
   */
  mute() {
    this.isMuted = true;
    Howler.mute(true);
  }

  /**
   * Unmute all audio globally via Howler.
   */
  unmute() {
    this.isMuted = false;
    Howler.mute(false);
  }

  /**
   * Toggle mute state.
   */
  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  // ---------------------------------------------------------------------------
  // Volume setters (accept 0-100, convert to 0-1 internally)
  // ---------------------------------------------------------------------------

  /**
   * Set ambient channel volume.
   * @param {number} vol - Volume from 0 to 100
   */
  setAmbientVolume(vol) {
    this.ambientVolume = Math.max(0, Math.min(1, vol / 100));
    if (this.ambient) {
      this.ambient.volume(this.ambientVolume * this.masterVolume);
    }
  }

  /**
   * Set BGM channel volume.
   * @param {number} vol - Volume from 0 to 100
   */
  setBgmVolume(vol) {
    this.bgmVolume = Math.max(0, Math.min(1, vol / 100));
    if (this.bgm) {
      this.bgm.volume(this.bgmVolume * this.masterVolume);
    }
  }

  /**
   * Set SFX channel volume.
   * @param {number} vol - Volume from 0 to 100
   */
  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol / 100));
  }

  /**
   * Set pronunciation channel volume.
   * @param {number} vol - Volume from 0 to 100
   */
  setPronunciationVolume(vol) {
    this.pronunciationVolume = Math.max(0, Math.min(1, vol / 100));
  }

  // ---------------------------------------------------------------------------
  // BGM (Background Music)
  // ---------------------------------------------------------------------------

  /**
   * Play background music with crossfade.
   * Current BGM fades out over 800ms, new one fades in over 800ms.
   * Maps track name to: /assets/audio/bgm/bgm-{trackName}.mp3
   * If already playing the same track, does nothing.
   * @param {string} trackName - e.g. "oasis", "library", "menu"
   */
  playBGM(trackName) {
    if (!trackName) return;

    // Already playing this track -- skip
    if (this.bgmTrack === trackName && this.bgm && this.bgm.playing()) {
      return;
    }

    this.bgmWasPaused = false;
    const src = `/assets/audio/bgm/bgm-${trackName}.mp3`;

    // Fade out current BGM if one is playing
    if (this.bgm) {
      const old = this.bgm;
      old.fade(old.volume(), 0, 800);
      old.once('fade', () => {
        old.stop();
        old.unload();
      });
    }

    const targetVolume = this.bgmVolume * this.masterVolume;

    // Create and fade in new BGM
    const newBgm = new Howl({
      src: [src],
      loop: true,
      volume: 0,
      onloaderror: () => {
        // File doesn't exist for this track -- silently skip
        this.bgm = null;
        this.bgmTrack = null;
      },
    });

    this.bgm = newBgm;
    this.bgmTrack = trackName;

    newBgm.once('load', () => {
      newBgm.play();
      newBgm.fade(0, targetVolume, 800);
    });
  }

  /**
   * Stop the currently playing BGM with fadeout.
   */
  stopBGM() {
    if (this.bgm) {
      const old = this.bgm;
      old.fade(old.volume(), 0, 800);
      old.once('fade', () => {
        old.stop();
        old.unload();
      });
      this.bgm = null;
      this.bgmTrack = null;
      this.bgmWasPaused = false;
    }
  }

  /**
   * Pause BGM with a short fadeout (for quiz overlay, etc.).
   */
  pauseBGM() {
    if (this.bgm && this.bgm.playing()) {
      const bgmRef = this.bgm;
      bgmRef.fade(bgmRef.volume(), 0, 300);
      bgmRef.once('fade', () => {
        bgmRef.pause();
      });
      this.bgmWasPaused = true;
    }
  }

  /**
   * Resume BGM after pause with a short fadein.
   */
  resumeBGM() {
    if (this.bgmWasPaused && this.bgm) {
      const targetVolume = this.bgmVolume * this.masterVolume;
      this.bgm.play();
      this.bgm.fade(0, targetVolume, 300);
      this.bgmWasPaused = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Ambient
  // ---------------------------------------------------------------------------

  /**
   * Play ambient loop for a zone with crossfade.
   * Current ambient fades out over 500ms, new one fades in over 500ms.
   * Maps zone name to: /assets/audio/ambient/ambient-{zoneName}.mp3
   * If already playing the same zone, does nothing.
   * @param {string} zoneName - e.g. "oasis", "market", "desert"
   */
  playAmbient(zoneName) {
    if (!zoneName) return;

    // Already playing this zone -- skip
    if (this.ambientZone === zoneName && this.ambient && this.ambient.playing()) {
      return;
    }

    const src = `/assets/audio/ambient/ambient-${zoneName}.mp3`;

    // Fade out current ambient if one is playing
    if (this.ambient) {
      const old = this.ambient;
      old.fade(old.volume(), 0, 500);
      old.once('fade', () => {
        old.stop();
        old.unload();
      });
    }

    const targetVolume = this.ambientVolume * this.masterVolume;

    // Create and fade in new ambient
    const newAmbient = new Howl({
      src: [src],
      loop: true,
      volume: 0,
      onloaderror: () => {
        // File doesn't exist for this zone -- silently skip
        this.ambient = null;
        this.ambientZone = null;
      },
    });

    this.ambient = newAmbient;
    this.ambientZone = zoneName;

    newAmbient.once('load', () => {
      newAmbient.play();
      newAmbient.fade(0, targetVolume, 500);
    });
  }

  /**
   * Stop the currently playing ambient sound.
   */
  stopAmbient() {
    if (this.ambient) {
      const old = this.ambient;
      old.fade(old.volume(), 0, 500);
      old.once('fade', () => {
        old.stop();
        old.unload();
      });
      this.ambient = null;
      this.ambientZone = null;
    }
  }

  // ---------------------------------------------------------------------------
  // SFX
  // ---------------------------------------------------------------------------

  /**
   * Play a one-shot sound effect.
   * Files at: /assets/audio/sfx/sfx-{name}.ogg
   * Cached for reuse after first load.
   *
   * Supported names:
   *   click, correct, wrong, levelup, quest, coin,
   *   wordlearned, chest, transition, streak, bookopen,
   *   bookflip, footstep
   *
   * @param {string} name - SFX identifier
   */
  playSFX(name) {
    if (!name) return;

    const effectiveVolume = this.sfxVolume * this.masterVolume;

    if (!this.sfxCache[name]) {
      this.sfxCache[name] = new Howl({
        src: [`/assets/audio/sfx/sfx-${name}.ogg`],
        volume: effectiveVolume,
        onloaderror: () => {
          // Missing SFX file -- remove from cache so it can retry later
          delete this.sfxCache[name];
        },
      });
    }

    const howl = this.sfxCache[name];
    howl.volume(effectiveVolume);
    howl.play();
  }

  // ---------------------------------------------------------------------------
  // Pronunciation
  // ---------------------------------------------------------------------------

  /**
   * Play Arabic word pronunciation.
   * Files at: /assets/audio/words/{wordId}.mp3
   * Uses LRU cache to prevent memory leaks from creating unlimited Howl instances.
   * @param {string} wordId - Word identifier matching the vocabulary data
   */
  playWord(wordId) {
    if (!wordId) return;

    const effectiveVolume = this.pronunciationVolume * this.masterVolume;

    // Check cache first
    let howl = this.wordCache.get(wordId);

    if (!howl) {
      // Create new Howl and add to cache
      howl = new Howl({
        src: [`/assets/audio/words/${wordId}.mp3`],
        volume: effectiveVolume,
        onloaderror: () => {
          console.warn(`[AudioManager] Missing word audio: ${wordId}`);
        },
      });
      this.wordCache.set(wordId, howl);
    } else {
      // Update volume in case it changed
      howl.volume(effectiveVolume);
    }

    howl.play();
  }

  /**
   * Play Arabic letter pronunciation.
   * Files at: /assets/audio/letters/{letter}.mp3
   * Uses LRU cache to prevent memory leaks.
   * @param {string} letter - Arabic letter character or transliterated name
   */
  playLetter(letter) {
    if (!letter) return;

    const effectiveVolume = this.pronunciationVolume * this.masterVolume;

    // Check cache first
    let howl = this.letterCache.get(letter);

    if (!howl) {
      // Create new Howl and add to cache
      howl = new Howl({
        src: [`/assets/audio/letters/${letter}.mp3`],
        volume: effectiveVolume,
        onloaderror: () => {
          console.warn(`[AudioManager] Missing letter audio: ${letter}`);
        },
      });
      this.letterCache.set(letter, howl);
    } else {
      // Update volume in case it changed
      howl.volume(effectiveVolume);
    }

    howl.play();
  }

  /**
   * Clean up all cached audio resources.
   * Call this when the app is being unmounted or reset.
   */
  cleanup() {
    // Clean up ambient
    if (this.ambient) {
      this.ambient.unload();
      this.ambient = null;
      this.ambientZone = null;
    }

    // Clean up BGM
    if (this.bgm) {
      this.bgm.unload();
      this.bgm = null;
      this.bgmTrack = null;
      this.bgmWasPaused = false;
    }

    // Clean up SFX cache
    Object.values(this.sfxCache).forEach(howl => howl.unload());
    this.sfxCache = {};

    // Clean up LRU caches
    this.wordCache.clear();
    this.letterCache.clear();
  }
}

export const audioManager = new AudioManager();

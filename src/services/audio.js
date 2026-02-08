import { Howl } from 'howler';

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
 * Three independent volume channels: ambient, sfx, pronunciation
 * Each channel has its own volume control (0-1 internally)
 */
class AudioManager {
  constructor() {
    /** @type {Howl|null} Currently playing ambient Howl */
    this.ambient = null;
    /** @type {string|null} Current ambient zone name for dedup */
    this.ambientZone = null;

    // Channel volumes (0-1 internal range)
    this.ambientVolume = 0.7;
    this.sfxVolume = 0.8;
    this.pronunciationVolume = 1.0;

    /** @type {Object<string, Howl>} Cached SFX Howl objects keyed by name */
    this.sfxCache = {};

    /** @type {LRUCache} LRU cache for word pronunciations (prevents memory leak) */
    this.wordCache = new LRUCache(50);

    /** @type {LRUCache} LRU cache for letter pronunciations */
    this.letterCache = new LRUCache(28);
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
      this.ambient.volume(this.ambientVolume);
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
      newAmbient.fade(0, this.ambientVolume, 500);
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

    if (!this.sfxCache[name]) {
      this.sfxCache[name] = new Howl({
        src: [`/assets/audio/sfx/sfx-${name}.ogg`],
        volume: this.sfxVolume,
        onloaderror: () => {
          // Missing SFX file -- remove from cache so it can retry later
          delete this.sfxCache[name];
        },
      });
    }

    const howl = this.sfxCache[name];
    howl.volume(this.sfxVolume);
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

    // Check cache first
    let howl = this.wordCache.get(wordId);

    if (!howl) {
      // Create new Howl and add to cache
      howl = new Howl({
        src: [`/assets/audio/words/${wordId}.mp3`],
        volume: this.pronunciationVolume,
        onloaderror: () => {
          console.warn(`[AudioManager] Missing word audio: ${wordId}`);
        },
      });
      this.wordCache.set(wordId, howl);
    } else {
      // Update volume in case it changed
      howl.volume(this.pronunciationVolume);
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

    // Check cache first
    let howl = this.letterCache.get(letter);

    if (!howl) {
      // Create new Howl and add to cache
      howl = new Howl({
        src: [`/assets/audio/letters/${letter}.mp3`],
        volume: this.pronunciationVolume,
        onloaderror: () => {
          console.warn(`[AudioManager] Missing letter audio: ${letter}`);
        },
      });
      this.letterCache.set(letter, howl);
    } else {
      // Update volume in case it changed
      howl.volume(this.pronunciationVolume);
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

    // Clean up SFX cache
    Object.values(this.sfxCache).forEach(howl => howl.unload());
    this.sfxCache = {};

    // Clean up LRU caches
    this.wordCache.clear();
    this.letterCache.clear();
  }
}

export const audioManager = new AudioManager();

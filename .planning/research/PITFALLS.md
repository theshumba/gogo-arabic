# Domain Pitfalls

**Domain:** Game Soul & Polish for Phaser 3 + React Arabic Learning RPG
**Researched:** 2026-02-09
**Focus:** Audio system, particle effects, NPC AI, building interiors, game feel polish

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Audio Autoplay Policy Violation

**What goes wrong:** Audio fails to play on mobile browsers and some desktop browsers. Users experience silent gameplay or sounds only work intermittently after first user interaction.

**Why it happens:** Browser autoplay policies require AudioContext to be resumed after a user gesture. Phaser will automatically resume the AudioContext when the game gains focus, but background music or ambient sounds that attempt to play before any user interaction will be blocked. On iOS, audio won't play at all if the device ringer is set to vibrate.

**Consequences:** Silent game, poor user experience, support tickets, players think game is broken.

**Prevention:**
- Create an explicit "Start Game" or "Tap to Play" screen that requires user interaction
- Call `this.sound.context.resume()` on the first user gesture (touch, click, keydown)
- Use Phaser's built-in `unlocked` property to check if AudioContext is ready
- Prime all audio on user-initiated events by calling `play()` then immediately `pause()`
- Test on iOS with ringer in both normal and vibrate modes

**Detection:**
- Audio works on desktop Chrome but not mobile Safari
- Console warnings about "AudioContext was not allowed to start"
- Sounds play after first click/tap but not on page load
- Audio works inconsistently between browser tabs

### Pitfall 2: Web Audio Memory Leaks

**What goes wrong:** Memory usage grows continuously during gameplay, eventually causing performance degradation, browser tab crashes, or "Out of Memory" errors. Profiling shows AudioBufferSourceNode references not being freed.

**Why it happens:** Calling `context.decodeAudioData()` creates ArrayBuffers that aren't garbage collected unless `context.close()` is explicitly called. Creating multiple AudioContext instances without cleanup causes severe memory bloat. Sound objects that play repeatedly (UI clicks, NPC dialogue) create new buffer source nodes that accumulate in memory.

**Consequences:** Game crashes after 10-15 minutes, audio crackling, frame rate drops, browser tab unresponsive.

**Prevention:**
- Use ONE AudioContext for the entire application (reuse Phaser's sound manager)
- Call `context.close()` when destroying audio systems or switching major game states
- Use Phaser's built-in sound pooling (HTML5Audio for mobile, WebAudio for desktop)
- Disconnect and destroy audio nodes after playback: `node.disconnect(); node = null`
- Prefer audio sprites over individual files for UI sounds and short effects
- Clear unused audio assets: `this.cache.audio.remove(key)`
- Monitor memory usage in Performance tab during long play sessions

**Detection:**
- Memory usage increases steadily in Chrome DevTools Performance Monitor
- Audio crackling or distortion after 10-15 minutes of gameplay
- Frame rate drops over time without visual changes
- Browser tab becomes unresponsive after extended gameplay
- Heap snapshots show increasing AudioBuffer/AudioBufferSourceNode counts

### Pitfall 3: Particle Emitter Performance Collapse

**What goes wrong:** Frame rate drops from 60fps to 15-30fps when particle effects are active. Mobile devices become unplayably slow. Visual effects that look fine on desktop cause mobile browsers to freeze.

**Why it happens:** Creating too many active particles simultaneously (200+ particles on mobile, 1000+ on desktop). Using high-resolution particle textures instead of small pixel art sprites. Creating new ParticleEmitter instances instead of reusing them. Running multiple emitters without using `viewBounds` to cull off-screen particles. Not setting `maxParticles` or `frequency` limits.

**Consequences:** Game becomes unplayable, poor reviews, users abandon on mobile.

**Prevention:**
- **Mobile budget:** 50-100 particles max per emitter, 200 total on-screen
- **Desktop budget:** 200-500 particles max per emitter, 1000 total on-screen
- Use `emitter.setViewBounds(camera.worldView)` to cull off-screen particles
- Set explicit `maxParticles` and `stopAfter` limits
- Reuse emitters with `emitter.stop()` then reconfigure, don't destroy/recreate
- Use tiny particle textures (4x4 to 16x16 pixels) for pixel art aesthetic
- Pool emitter instances: create once, show/hide as needed
- Use `emitter.pause()` when emitter is off-screen instead of destroying
- Test on low-end mobile device (iPhone SE or equivalent Android)

**Detection:**
- FPS drops immediately when particle effect starts
- Chrome DevTools Performance shows long "Composite Layers" times
- Mobile devices exhibit touch input lag during particle effects
- Particle effects look choppy or delayed
- Game stutters when multiple NPCs have active effects

### Pitfall 4: NPC Pathfinding Frame Rate Destruction

**What goes wrong:** Game freezes or drops to 5-10 fps when multiple NPCs calculate paths simultaneously. Pathfinding works fine with 5-10 NPCs but becomes unplayable with 140 NPCs across 8 zones.

**Why it happens:** Running A* pathfinding synchronously on every frame for all active NPCs. Recalculating paths every frame instead of caching results. Using grid-based pathfinding on large maps (50x50 tiles = 2,500 nodes searched per NPC). All NPCs in a zone recalculating paths at the same time when player moves.

**Consequences:** Game becomes unplayable in crowded zones, poor performance reputation, refund requests.

**Prevention:**
- Use NavMesh plugin instead of EasyStar/A* grid pathfinding (187x faster for long paths, 5x faster for short paths)
- Stagger pathfinding across frames: only 2-3 NPCs calculate paths per frame
- Cache paths and recalculate only when player moves significantly (>32 pixels)
- Use simpler "follow player" behavior for most NPCs, complex pathing for quest-critical NPCs only
- Disable pathfinding for NPCs outside camera view + buffer zone (100px)
- **Budget:** Max 5 active pathfinding NPCs per frame, defer others to next frame
- For wandering NPCs, use random walk instead of pathfinding to predetermined points
- Consider web worker for pathfinding calculations (requires serializable data)

**Detection:**
- FPS drops when entering crowded zones (market, town center)
- Profiler shows high CPU time in pathfinding functions
- NPCs freeze in place momentarily then jump to new positions
- Touch/click input feels unresponsive in zones with many NPCs
- Frame time spikes visible in Performance Monitor

### Pitfall 5: Scene Transition State Loss

**What goes wrong:** Player enters a building, game transitions to interior scene, but when exiting back to overworld, player data (position, quest progress, inventory) is reset or corrupted. NPCs respawn in wrong positions. Game state becomes inconsistent.

**Why it happens:** Using `scene.start()` instead of `scene.launch()`, which shuts down the previous scene and loses its state. Not persisting critical state to Redux before scene transitions. Storing state in scene instance variables instead of scene data or registry. Scene transition events firing before data is saved. Not handling `transitioninit` vs `transitionstart` vs `transitioncomplete` events correctly.

**Consequences:** Data loss, game-breaking bugs, players lose progress, support tickets.

**Prevention:**
- Use `scene.launch(key, data)` to run scenes in parallel, not `scene.start()`
- For building interiors: pause overworld scene, launch interior scene, on exit destroy interior and resume overworld
- Always emit EventBus state updates BEFORE calling scene transition methods
- Store player position/state in Redux before transition, restore in `transitioninit`
- Use scene registry for cross-scene persistence (player health, currency)
- Wait for `transitioncomplete` event before allowing new transitions
- Check `scene.isTransitioning()` before initiating new transitions
- Add transition guard: prevent rapid scene switches (debounce 500ms)

**Detection:**
- Player position resets when exiting buildings
- Console errors about "scene already transitioning"
- Redux state differs from Phaser scene state after transitions
- Quest progress lost when moving between zones
- NPCs duplicated or missing after scene transitions
- Input events fire in both scenes during transition

### Pitfall 6: EventBus Memory Leak from Stale Listeners

**What goes wrong:** Memory usage grows over time. Event handlers fire multiple times for single event. Callbacks execute on destroyed objects, causing errors. Performance degrades after multiple scene changes.

**Why it happens:** Adding EventBus listeners in Phaser scenes or React components without removing them on cleanup. Using arrow functions or bound methods as listeners (creates new function reference, can't remove). Restarting scenes without calling `off()` for previous listeners. React components unmounting without EventBus cleanup in useEffect return.

**Consequences:** Memory leaks, duplicate event handlers, crashes, "Can't update unmounted component" errors.

**Prevention:**
- Store listener references: `this.handleEvent = this.handleEvent.bind(this)` in constructor
- Always remove listeners in scene `shutdown` event: `EventBus.off('event', this.handleEvent, this)`
- React useEffect cleanup: `return () => EventBus.off('event', handler)`
- Use named functions, not arrow functions, so you can remove them
- Create scene-specific event names to avoid cross-scene collisions
- Clear all listeners on scene shutdown: track them in array, loop through `off()`
- Audit listeners in Chrome DevTools Memory Profiler (look for detached listeners)

**Detection:**
- Same console.log appears multiple times for single event
- Memory snapshots show increasing EventEmitter listener counts
- Errors about calling methods on undefined/null objects
- Events trigger in scenes that should be inactive
- React DevTools shows components updating after unmount

### Pitfall 7: Texture Atlas Memory Overflow

**What goes wrong:** Game fails to load textures, shows blank sprites, or crashes with WebGL context loss errors. Mobile devices show "out of memory" warnings.

**Why it happens:** Texture atlases larger than GPU maximum texture size (often 4096x4096 on mobile, 8192x8192 desktop). Loading all zone textures at once instead of dynamically loading per zone. Not using power-of-two dimensions (waste GPU memory). Multiple small atlases instead of one optimized atlas per zone.

**Consequences:** Crashes, visual glitches, poor mobile performance, refund requests.

**Prevention:**
- Target 2048x2048 max for mobile compatibility
- One atlas per zone (8 zones = 8 atlases), load/unload on zone transitions
- Use TexturePacker or similar to optimize packing efficiency
- Always use power-of-two dimensions (512, 1024, 2048, 4096)
- Remove loaded textures when leaving zone: `this.textures.remove(key)`
- Enable WebGL compressed textures in Phaser v3.60+ config
- Monitor texture memory in Performance tab (look for GPU process)
- Test on mid-range mobile device (typically more restrictive GPU limits)

**Detection:**
- WebGL context lost errors in console
- Sprites render as white/transparent boxes
- Game crashes on zone transitions with many assets
- Memory warnings on mobile devices
- Different behavior between desktop and mobile
- DevTools shows high GPU memory usage

### Pitfall 8: Redux/Phaser State Desync

**What goes wrong:** React UI shows different player health than Phaser game. Quest progress updates in Redux but NPC dialogue doesn't reflect changes. Player unlocks item in Phaser but React inventory doesn't update. State becomes "source of truth" ambiguous.

**Why it happens:** Updating Phaser scene state without dispatching Redux actions. Updating Redux without emitting EventBus events that Phaser listens to. Race conditions between EventBus emit and Redux dispatch. Async Redux thunks resolving after Phaser state already changed. Using scene data instead of Redux as canonical state.

**Consequences:** Data inconsistency, game-breaking bugs, lost progress, support tickets.

**Prevention:**
- **Single source of truth:** Redux is canonical, Phaser reads from it
- **Pattern:** User input (Phaser) → EventBus emit → React component → Redux dispatch → EventBus emit → Phaser updates
- Never update Phaser scene state directly for persistent data (position, stats, inventory)
- Subscribe to Redux store in Phaser scenes, update on state changes
- Use EventBus only for transient events (dialogue opened, animation started)
- **Sequence:** Phaser detects event → emit → React updates Redux → Phaser reads new Redux state
- Add state sync verification function that compares Redux vs Phaser state

**Detection:**
- React UI shows stale data compared to game visuals
- Saving/loading produces inconsistent state
- Features work until page refresh, then break
- Player actions don't trigger UI updates
- Console shows Redux state differs from EventBus payload
- E2E tests pass but manual testing finds bugs

---

## Moderate Pitfalls

Annoying but fixable without major rewrites.

### Pitfall 9: Tween Accumulation and Cleanup

**What goes wrong:** Creating hundreds of tweens without cleanup. Memory grows, GC pauses cause stuttering. Tweens continue playing on destroyed objects, causing errors.

**Why it happens:** Creating new tweens in update loop, not removing on complete. Destroying game objects without stopping their tweens.

**Consequences:** Memory leaks, stuttering, visual glitches.

**Prevention:**
- Use `onComplete: () => tween.remove()` for all tweens
- Stop tweens before destroying objects: `this.tweens.killTweensOf(object)`
- Reuse tweens with `tween.restart()` instead of creating new ones
- Pool tween targets (sprites, particles) instead of creating new objects
- **Budget:** Max 100 active tweens simultaneously

**Detection:**
- Memory profiler shows growing tween object counts
- Stuttering after 5+ minutes gameplay
- Errors about undefined object properties during animations

### Pitfall 10: Audio Sprites vs Individual Files

**What goes wrong:** Loading 50+ individual sound files causes slow initial load, many HTTP requests, and autoplay unlock complexity.

**Why it happens:** Didn't consolidate sounds into audio sprites. Each sound is separate file.

**Consequences:** Slow load times, poor mobile experience, network congestion.

**Prevention:**
- Use audio sprites for UI sounds and short effects (1-5 second sounds)
- Combine related sounds into single audio sprite file
- Prime audio sprite on first user gesture, have all sounds ready instantly
- **Warning:** Don't make audio sprite too large (keep under 1-2MB)
- Use individual files for music and long ambient sounds

**Detection:**
- Network tab shows 50+ audio requests
- Initial load time >5 seconds
- Audio unlock inconsistent across sounds

### Pitfall 11: Screen Shake Without Reduced Motion Check

**What goes wrong:** Screen shake and camera effects cause motion sickness, vertigo, nausea for ~30% of users. Violates accessibility guidelines.

**Why it happens:** Implementing "game feel" effects without checking `prefers-reduced-motion` setting.

**Consequences:** User complaints, motion sickness, poor reviews, accessibility lawsuit risk.

**Prevention:**
- Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before screen shake
- Provide settings toggle to disable camera effects
- Disable or significantly reduce screen shake when setting enabled
- Also disable/reduce particle effects when reduced motion enabled
- Test with OS reduced motion setting enabled

**Detection:**
- Test with macOS System Settings → Accessibility → Display → Reduce motion enabled
- Test with Windows Settings → Ease of Access → Display → Show animations disabled
- User complaints about motion sickness in reviews

### Pitfall 12: Mobile Touch Audio Unlock Timing

**What goes wrong:** User taps "Start Game", but audio doesn't unlock because touch event handled incorrectly. Subsequent audio plays fine but first sound is silent.

**Why it happens:** AudioContext.resume() called in async callback after touch event completes. Browser requires resume() to be called synchronously during user gesture.

**Consequences:** First sound doesn't play, confusing UX.

**Prevention:**
- Call `this.sound.context.resume()` synchronously in touch event handler
- Don't await promises before calling resume()
- Test on iOS Safari (most restrictive) and Android Chrome
- Show user feedback when audio is unlocked ("Sound enabled!")

**Detection:**
- First tap doesn't play audio, second tap does
- Works on desktop but not mobile
- Console warnings about AudioContext not unlocked

### Pitfall 13: Pathfinding Cache Invalidation

**What goes wrong:** NPC calculates path to player, player moves, NPC follows cached outdated path, ends up in wrong location.

**Why it happens:** Caching paths for performance but not invalidating when player moves significantly.

**Consequences:** NPCs follow player poorly, look "dumb", immersion broken.

**Prevention:**
- Store player position when path calculated
- Invalidate cache if player moved >32 pixels (1 tile) since calculation
- Recalculate path after N frames (e.g., every 60 frames = 1 second)
- Balance performance vs accuracy

**Detection:**
- NPCs walk to where player was, not where player is
- NPCs take inefficient routes
- Manual testing shows poor following behavior

### Pitfall 14: Building Interior Asset Loading Delays

**What goes wrong:** Player clicks door, game freezes for 1-2 seconds while loading interior assets, then interior appears. Feels broken.

**Why it happens:** Not preloading building interior assets. Loading synchronously on transition.

**Consequences:** Poor UX, feels laggy, immersion broken.

**Prevention:**
- Preload interior assets when player is near building (within 100px)
- Show "Loading..." or door opening animation during load
- Cache loaded interior assets for fast re-entry
- Unload interiors when player moves far away (>500px from building)

**Detection:**
- Manual test: click building door, observe freeze
- Performance profiler shows long asset load time during transition
- User feedback about laggy building entry

---

## Minor Pitfalls

Small issues, easy fixes.

### Pitfall 15: Particle Texture Filter Blur

**What goes wrong:** Pixel art particle textures appear blurry, losing pixel art aesthetic.

**Why it happens:** WebGL default texture filter is LINEAR (anti-aliased). Need NEAREST for pixel art.

**Consequences:** Visual inconsistency, blurry particles.

**Prevention:**
- Set Phaser config: `render: { pixelArt: true }` to use NEAREST filter globally
- Or per texture: `texture.setFilter(Phaser.Textures.FilterMode.NEAREST)`

**Detection:**
- Particles look blurry/anti-aliased
- Visual comparison with sprite textures

### Pitfall 16: Audio Volume Not Respecting Settings

**What goes wrong:** User sets volume to 50% in settings, but new sounds play at 100%.

**Why it happens:** Not reading volume setting when playing sounds. Setting volume only on existing sound instances.

**Consequences:** User frustration, feels like settings don't work.

**Prevention:**
- Store volume in Redux settings slice
- Read volume setting when playing sounds: `this.sound.play(key, { volume: volumeSetting })`
- Subscribe to Redux settings changes in Phaser, update sound manager volume

**Detection:**
- Change volume setting, trigger new sound, check volume
- E2E test: set volume to 0, verify no sound plays

### Pitfall 17: NPC Wandering Overlap

**What goes wrong:** Multiple wandering NPCs choose same random destination, cluster together, look unnatural.

**Why it happens:** Pure random destination selection, no collision avoidance.

**Consequences:** Visual crowding, NPCs overlap, looks broken.

**Prevention:**
- Add minimum distance check: don't select destination if another NPC within 64px
- Use "arrival radius" so NPCs don't stack on exact point
- Consider flocking/steering behaviors for groups

**Detection:**
- Manual observation: NPCs cluster together
- Visual review in crowded zones

### Pitfall 18: Scene Registry vs Scene Data Confusion

**What goes wrong:** Storing data in scene registry, expecting it to be scene-specific, but registry is global. Data shared across all scenes unexpectedly.

**Why it happens:** Confusion between `this.registry` (global) and `this.data` (scene-specific).

**Consequences:** State pollution, bugs across scenes.

**Prevention:**
- Use `this.registry` for truly global data (player health, currency)
- Use `this.data` for scene-specific data (current dialogue, temp state)
- Document which data belongs where

**Detection:**
- Scene data unexpectedly persists across scene changes
- Data changes in one scene affect another scene

### Pitfall 19: Tween Easing Inconsistency

**What goes wrong:** Some tweens use 'Power2', some use 'Cubic', visual inconsistency in animation feel.

**Why it happens:** Ad-hoc tween creation, no design system for easing.

**Consequences:** Inconsistent animation feel, unprofessional.

**Prevention:**
- Define standard easings in constants: `EASE_IN = 'Power2'`, `EASE_OUT = 'Power2'`, `EASE_BOUNCE = 'Bounce.easeOut'`
- Document when to use each easing
- Code review for tween consistency

**Detection:**
- Review tween code, count distinct easing functions
- Manual review: animations feel inconsistent

### Pitfall 20: Particle Emitter Z-Index Issues

**What goes wrong:** Particle effects appear behind player or UI when they should be in front.

**Why it happens:** Particle emitters added to scene at wrong depth. Z-index not set.

**Consequences:** Visual glitches, particles hidden.

**Prevention:**
- Use `emitter.setDepth(depth)` to control layering
- Define depth constants: `DEPTH_GROUND = 0`, `DEPTH_PLAYER = 10`, `DEPTH_PARTICLES = 20`, `DEPTH_UI = 100`
- Document depth layers

**Detection:**
- Manual observation: particles appear behind objects
- Visual review of effects

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Phase 14: Audio** | Audio autoplay blocked on mobile | Add "Tap to Play" screen, resume AudioContext on first gesture |
| **Phase 14: Audio** | Web Audio memory leak from multiple contexts | Reuse Phaser sound manager, call context.close() on cleanup |
| **Phase 14: Audio** | Audio sprites too large (>2MB) | Split into multiple sprites by category (UI, NPC, ambient) |
| **Phase 15: Visual Effects** | Too many particles crash mobile | Set budget: 200 particles max mobile, use viewBounds culling |
| **Phase 15: Visual Effects** | Particle textures blurry | Set `render: { pixelArt: true }` in Phaser config |
| **Phase 15: Visual Effects** | WebGL context loss from texture overload | Max 2048x2048 atlases, load/unload per zone |
| **Phase 16: NPC Life** | 140 NPCs pathfinding = 5fps | Use NavMesh, stagger pathfinding (max 5/frame), cache paths |
| **Phase 16: NPC Life** | NPC wandering looks unnatural | Add arrival radius, minimum distance between NPCs |
| **Phase 17: Building Interiors** | State lost on scene transitions | Use scene.launch() not scene.start(), persist to Redux |
| **Phase 17: Building Interiors** | 1-2s freeze when entering building | Preload assets when near building, show loading animation |
| **Phase 18: Game Feel** | Screen shake causes motion sickness | Check prefers-reduced-motion, add settings toggle |
| **Phase 18: Game Feel** | Tween accumulation causes memory leak | Add onComplete cleanup, killTweensOf before destroy |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Too many active particles | FPS drops to 20-30, input lag | Mobile: 200 total, Desktop: 1000 total, use viewBounds culling | >200 particles on mobile |
| Synchronous pathfinding | Frame freezes, stuttering movement | Stagger across frames (max 5/frame), use NavMesh not A* | >10 NPCs pathfinding same frame |
| Unbounded tween creation | Memory growth, GC pauses | Reuse tweens, remove on complete, pool tween targets | >100 active tweens |
| Loading all zone assets | Initial load >10s, memory warnings | Lazy load per zone, preload adjacent zones only | >3 zones loaded simultaneously |
| EventBus listener accumulation | Slows over time, handlers fire 2-10x | Remove in shutdown/useEffect cleanup | >50 listeners total |
| Texture atlas over GPU limit | WebGL context loss, white sprites | Max 2048x2048 mobile, 4096x4096 desktop, split by zone | >4096x4096 on any platform |
| Creating audio buffers in loop | Memory leak, audio crackling after 10 min | Use audio sprites, pool sound objects, close contexts | >100 unique audio files |
| Update loop object allocation | GC pressure, stuttering | Object pooling for bullets, effects, UI elements | >50 new objects/frame |
| Redux state thrashing | React re-renders 100+/sec, UI lag | Batch updates, debounce Phaser→Redux sync | >30 dispatches/frame |
| No reduced motion check | Motion sickness complaints | Check prefers-reduced-motion, disable shake/particles | Affects ~30% of users |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Audio autoplays without warning | User startled, poor mobile experience | Require "Start Game" button, show audio icon |
| Screen shake without reduced motion check | Motion sickness, vertigo for 30% of users | Check prefers-reduced-motion, make shake optional in settings |
| Particles on every UI interaction | Visual noise, accessibility issues | Reserve particles for meaningful moments (level up, quest complete) |
| No loading indicators during transitions | Feels broken, users click multiple times | Show "Loading..." or transition animation |
| Music loops without fade | Jarring restart audible | Crossfade or use seamless loop points |
| Building interiors take >1s to load | Feels laggy, breaks immersion | Preload adjacent building assets, show door opening animation during load |
| NPC dialogue starts before audio unlocked | Silent dialogue, confusing | Show "Tap to start" if audio not unlocked |
| Effects ignore battery saver mode | Drains battery quickly on mobile | Reduce particle count and audio on low battery |

---

## "Looks Done But Isn't" Checklist

- [ ] **Audio system:** Often missing mobile unlock flow — verify audio plays on first tap on iOS Safari
- [ ] **Particle effects:** Often missing maxParticles limit — verify FPS >30 on mobile with all effects active
- [ ] **NPC pathfinding:** Often missing frame staggering — verify 140 NPCs don't all pathfind same frame
- [ ] **Scene transitions:** Often missing state persistence — verify Redux state survives scene.restart()
- [ ] **EventBus cleanup:** Often missing useEffect return — verify Memory Profiler shows stable listener count
- [ ] **Texture atlases:** Often missing power-of-two check — verify atlas dimensions are 512/1024/2048
- [ ] **Reduced motion support:** Often missing prefers-reduced-motion check — verify screen shake disabled when OS setting enabled
- [ ] **Audio memory cleanup:** Often missing context.close() — verify Memory Profiler shows stable AudioBuffer count
- [ ] **Tween cleanup:** Often missing removeOnComplete — verify Heap snapshots don't accumulate tween objects
- [ ] **Asset unloading:** Often missing zone exit cleanup — verify texture memory drops when leaving zone

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Audio autoplay blocked | LOW | Add "Tap to Start" screen, resume AudioContext on first user gesture |
| Web Audio memory leak | MEDIUM | Audit all audio creation points, add context.close() to cleanup, switch to audio sprites |
| Particle performance collapse | LOW | Add maxParticles limits, implement viewBounds culling, reduce particle texture sizes |
| NPC pathfinding frame drops | MEDIUM | Refactor to NavMesh plugin, add frame staggering, cache paths |
| Scene transition state loss | HIGH | Refactor to scene.launch() pattern, add state persistence layer, audit all transitions |
| EventBus memory leak | MEDIUM | Audit all listeners, add cleanup in shutdown/useEffect, switch to named functions |
| Texture atlas GPU overflow | MEDIUM | Split into zone-specific atlases, add dynamic loading, remove unused textures |
| Redux/Phaser desync | HIGH | Establish single source of truth pattern, refactor all state mutations, add sync verification |
| Screen shake accessibility issue | LOW | Add prefers-reduced-motion check, add settings toggle, apply to all motion effects |
| Mobile touch audio broken | LOW | Add explicit touch unlock handler, test on iOS/Android, add user feedback |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Audio autoplay policy | Phase 14 | Manual test on iOS Safari, Android Chrome with fresh session |
| Web Audio memory leak | Phase 14 | Chrome Performance Monitor shows stable memory after 30 min gameplay |
| Particle performance collapse | Phase 15 | FPS >30 on mobile with all effects active simultaneously |
| NPC pathfinding frame drops | Phase 16 | Profiler shows <5ms pathfinding time per frame with 140 NPCs |
| Scene transition state loss | Phase 17 | E2E test: enter/exit building 10 times, verify state unchanged |
| EventBus memory leak | Phases 14-17 | Memory snapshot shows <100 total listeners after all features added |
| Texture atlas GPU overflow | Phase 15 | WebGL inspector shows no context loss, <2048x2048 atlases on mobile |
| Redux/Phaser desync | Phases 14-17 | Add state comparison test, run after every EventBus emit |
| Screen shake accessibility | Phase 18 | Test with OS reduced motion enabled, verify effects disabled |
| Touch audio unlock | Phase 14 | Test on iOS with silent mode, Android low-power mode |

---

## Sources

### Audio System
- [Phaser 3 AudioContext discussion](https://phaser.discourse.group/t/phaser-3-how-am-i-doing-audiocontext-stuff-wrong/778)
- [Web Audio Best Practices for Games in Phaser 3](https://blog.ourcade.co/posts/2020/phaser-3-web-audio-best-practices-games/)
- [Audio for Web games - MDN](https://developer.mozilla.org/en-US/docs/Games/Techniques/Audio_for_Web_Games)
- [Unlock JavaScript Web Audio in Safari](https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos)
- [Web Audio API memory leak issues](https://github.com/WebAudio/web-audio-api/issues/2484)
- [Phaser Web Audio memory leak](https://github.com/photonstorm/phaser/issues/5224)
- [Audio sprites vs individual files](https://medium.com/game-development-stuff/how-to-create-audiosprites-to-use-with-howler-js-beed5d006ac1)

### Particle Effects
- [Particles - Notes of Phaser 3](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/particles/)
- [How to manage lots of Particle Emitter Managers?](https://phaser.discourse.group/t/how-to-manage-lots-of-particle-emitter-managers/12654)
- [Reusing particle emitters](https://phaser.discourse.group/t/how-can-i-reuse-particle-emitter/12074)
- [Phaser 3 optimization article (2025)](https://franzeus.medium.com/how-i-optimized-my-phaser-3-action-game-in-2025-5a648753f62b)

### NPC Pathfinding
- [Mastering 2D Game Path Finding with Phaser3](https://medium.com/@tajammalmaqbool11/mastering-2d-game-path-finding-with-phaser3-ai-path-finding-301807c74ba3)
- [A to Z guide to pathfinding with Easystar and Phaser 3](https://gamedevjs.com/tutorials/a-to-z-guide-to-pathfinding-with-easystar-and-phaser-3/)
- [NavMesh plugin for Phaser 3](https://github.com/mikewesthad/navmesh)

### Scene Transitions & State Management
- [Understanding Scene Transitions](https://phaser.discourse.group/t/understanding-scene-transitions/5652)
- [Scene manager - Notes of Phaser 3](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scenemanager/)
- [Best practices for managing state](https://phaser.discourse.group/t/best-practices-for-managing-state/6518)
- [Scene Registry and Data](https://docs.phaser.io/phaser/concepts/data-manager)

### EventBus & Memory Management
- [Do I need to manually dispose of event listeners?](https://phaser.discourse.group/t/do-i-need-to-manually-dispose-of-event-listeners/13429)
- [Event listeners causing Memory Leaks](https://www.html5gamedevs.com/topic/40166-event-listeners-causing-memory-leaks/)
- [Phaser3 memory leak issue](https://github.com/photonstorm/phaser/issues/5456)

### Texture Atlases
- [Working with Texture Atlases in Phaser 3](https://airum82.medium.com/working-with-texture-atlases-in-phaser-3-25c4df9a747a)
- [Recommended number of Texture Atlases?](https://phaser.discourse.group/t/recommended-number-of-texture-atlases/15270)

### Performance Optimization
- [Phaser 3.60 Mobile Performance](https://github.com/phaserjs/phaser/blob/v3.60.0/changelog/3.60/MobilePerformance.md)
- [Object Pooling in Phaser 3](https://blog.ourcade.co/posts/2020/phaser-3-optimization-object-pool-basic/)
- [Tweens performance discussion](https://phaser.discourse.group/t/tweens-performance/10930)

### Phaser + React Integration
- [Official Phaser 3 React Template](https://github.com/phaserjs/template-react)
- [An architecture for Phaser JS + Redux](http://orta.io/notes/games/phaser-redux/)
- [Successfully Integrating Phaser 3 into React/Redux App](https://hopefourie.medium.com/successfully-integrating-phaser-3-into-your-react-redux-app-part-1-bade7feb460)

### Accessibility
- [Motion Sickness Accessibility in Video Games](https://madelinemiller.dev/blog/motion-sickness-accessibility/)
- [prefers-reduced-motion - CSS MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [Designing With Reduced Motion For Motion Sensitivities](https://www.smashingmagazine.com/2020/09/design-reduced-motion-sensitivities/)
- [Create accessible animations in React](https://motion.dev/docs/react-accessibility)

---
*Pitfalls research for: GoGo Arabic v4.0 Game Soul & Polish*
*Researched: 2026-02-09*

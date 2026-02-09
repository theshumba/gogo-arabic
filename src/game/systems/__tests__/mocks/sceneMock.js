import { vi } from 'vitest';

/**
 * Mock Phaser module for game system tests.
 * Provides minimal implementations of Phaser APIs used by game systems.
 */
vi.mock('phaser', () => ({
  default: {
    Math: {
      Distance: {
        Between: vi.fn((x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2))
      }
    },
    Input: {
      Keyboard: {
        JustDown: vi.fn(() => false),
        KeyCodes: {
          E: 69,
          SPACE: 32,
          M: 77,
          SHIFT: 16,
          W: 87,
          A: 65,
          S: 83,
          D: 68,
          UP: 38,
          DOWN: 40,
          LEFT: 37,
          RIGHT: 39
        }
      }
    },
    Physics: {
      Arcade: {
        Sprite: class MockSprite {
          constructor() {
            this.x = 0;
            this.y = 0;
            this.body = {
              setSize: vi.fn(),
              setOffset: vi.fn(),
              velocity: { x: 0, y: 0, normalize: vi.fn().mockReturnThis(), scale: vi.fn() }
            };
          }
          setOrigin() { return this; }
          setDepth() { return this; }
          setScale() { return this; }
          setSize() { return this; }
          setOffset() { return this; }
          setImmovable() { return this; }
          setCollideWorldBounds() { return this; }
          setVelocity(x, y) {
            this.body.velocity.x = x || 0;
            this.body.velocity.y = y || 0;
            return this;
          }
          setVelocityX(x) {
            this.body.velocity.x = x;
            return this;
          }
          setVelocityY(y) {
            this.body.velocity.y = y;
            return this;
          }
          play() { return this; }
          destroy() {}
          freeze() {}
          unfreeze() {}
          update() {}
          anims = {
            play: vi.fn(),
            exists: vi.fn(() => false),
            create: vi.fn(),
            generateFrameNumbers: vi.fn(() => [])
          };
        }
      }
    },
    Events: {
      EventEmitter: class MockEventEmitter {
        on() {}
        off() {}
        emit() {}
        once() {}
        removeAllListeners() {}
      }
    }
  }
}));

/**
 * Create a mock Phaser scene with all APIs used by game systems.
 * @param {Object} overrides - Optional overrides to merge with defaults
 * @returns {Object} Mock scene object
 */
export function createMockScene(overrides = {}) {
  const mockSprite = {
    x: 0,
    y: 0,
    setOrigin: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setScale: vi.fn().mockReturnThis(),
    setSize: vi.fn().mockReturnThis(),
    setOffset: vi.fn().mockReturnThis(),
    setTint: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    body: {
      setSize: vi.fn(),
      setOffset: vi.fn()
    },
    play: vi.fn().mockReturnThis(),
    anims: {
      play: vi.fn(),
      exists: vi.fn(() => false),
      create: vi.fn(),
      generateFrameNumbers: vi.fn(() => [])
    },
    destroy: vi.fn()
  };

  const mockImage = {
    ...mockSprite,
    setTint: vi.fn().mockReturnThis()
  };

  const mockText = {
    ...mockSprite,
    setText: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis()
  };

  const mockRectangle = {
    ...mockSprite,
    alpha: 1
  };

  const mockStaticGroup = {
    create: vi.fn().mockReturnValue({
      setVisible: vi.fn().mockReturnThis(),
      body: {
        setSize: vi.fn(),
        setOffset: vi.fn()
      },
      refreshBody: vi.fn()
    }),
    getChildren: vi.fn(() => []),
    clear: vi.fn()
  };

  const mockTilemap = {
    createLayer: vi.fn().mockReturnThis(),
    addTilesetImage: vi.fn().mockReturnThis(),
    getObjectLayer: vi.fn(() => ({
      objects: []
    })),
    setCollision: vi.fn(),
    layers: []
  };

  const mockTween = {
    remove: vi.fn(),
    stop: vi.fn(),
    play: vi.fn()
  };

  const defaultScene = {
    // Physics
    physics: {
      add: {
        collider: vi.fn(),
        sprite: vi.fn((x, y, key) => ({
          ...mockSprite,
          x,
          y
        })),
        staticGroup: vi.fn(() => mockStaticGroup)
      },
      world: {
        setBounds: vi.fn()
      }
    },

    // Add methods
    add: {
      image: vi.fn((x, y, key) => ({
        ...mockImage,
        x,
        y
      })),
      sprite: vi.fn((x, y, key) => ({
        ...mockSprite,
        x,
        y
      })),
      text: vi.fn((x, y, content, style) => ({
        ...mockText,
        x,
        y
      })),
      rectangle: vi.fn((x, y, w, h, color, alpha) => ({
        ...mockRectangle,
        x,
        y,
        alpha: alpha || 1
      })),
      existing: vi.fn(),
      tilemap: vi.fn(() => mockTilemap)
    },

    // Make methods
    make: {
      tilemap: vi.fn((config) => mockTilemap),
      graphics: vi.fn(() => ({
        fillStyle: vi.fn(),
        fillCircle: vi.fn(),
        generateTexture: vi.fn(),
        destroy: vi.fn()
      }))
    },

    // Camera
    cameras: {
      main: {
        scrollX: 0,
        scrollY: 0,
        width: 1024,
        height: 768,
        centerOn: vi.fn(),
        startFollow: vi.fn(),
        setBounds: vi.fn(),
        setZoom: vi.fn(),
        fadeOut: vi.fn(),
        fadeIn: vi.fn(),
        once: vi.fn((event, callback) => {
          // Auto-trigger callbacks for testing
          if (event === 'camerafadeoutcomplete' || event === 'camerafadeincomplete') {
            setTimeout(callback, 0);
          }
        })
      }
    },

    // Input
    input: {
      keyboard: {
        addKey: vi.fn((keyCode) => ({
          isDown: false,
          isUp: true
        })),
        createCursorKeys: vi.fn(() => ({
          up: { isDown: false },
          down: { isDown: false },
          left: { isDown: false },
          right: { isDown: false }
        })),
        addKeys: vi.fn(() => ({}))
      }
    },

    // Time
    time: {
      delayedCall: vi.fn((delay, callback) => {
        // Optionally auto-execute for testing
        return { remove: vi.fn() };
      })
    },

    // Tweens
    tweens: {
      add: vi.fn((config) => mockTween)
    },

    // Load
    load: {
      tilemapTiledJSON: vi.fn(),
      image: vi.fn()
    },

    // Scene management
    scene: {
      start: vi.fn(),
      key: 'TestScene'
    },

    // System
    sys: {
      game: {
        canvas: {
          width: 1024,
          height: 768,
          parentElement: {
            appendChild: vi.fn()
          }
        },
        loop: {
          delta: 16.67 // ~60fps
        }
      }
    },

    // Animations
    anims: {
      exists: vi.fn(() => false),
      create: vi.fn(),
      generateFrameNumbers: vi.fn((key, config) => {
        const frames = [];
        for (let i = config.start; i <= config.end; i++) {
          frames.push({ key, frame: i });
        }
        return frames;
      })
    },

    // Textures
    textures: {
      exists: vi.fn(() => true)
    },

    // Game reference for MapLoader
    game: {
      canvas: {
        width: 1024,
        height: 768
      }
    },

    // Custom properties for testing (can be set by WorldScene)
    currentMapW: 20,
    currentMapH: 15
  };

  // Deep merge overrides
  return mergeDeep(defaultScene, overrides);
}

/**
 * Deep merge utility for combining scene overrides
 */
function mergeDeep(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

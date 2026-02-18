import { store } from '../../store/store';
import { selectCurrentWeather, WEATHER_TYPES } from '../../store/slices/weatherSlice';

/**
 * WeatherSystem
 * Handles visual weather effects (particles, tints) in the Phaser scene.
 */
export class WeatherSystem {
    constructor(scene) {
        this.scene = scene;
        this.currentWeather = WEATHER_TYPES.CLEAR;
        this.particleManager = null;
        this.emitters = {};
        this.unsubscribe = null;

        // Create a particle manager for weather
        // We use a texture key 'weather-particles' which we'll generate
        this.createTextures();
        this.particleManager = this.scene.add.particles('weather-particle');
        this.particleManager.setDepth(9999); // Above everything

        // Subscribe to store updates
        this.unsubscribe = store.subscribe(() => {
            const state = store.getState();
            const newWeather = selectCurrentWeather(state);
            if (newWeather !== this.currentWeather) {
                this.setWeather(newWeather);
            }
        });

        // Initial set
        this.setWeather(selectCurrentWeather(store.getState()));
    }

    createTextures() {
        if (!this.scene.textures.exists('weather-particle')) {
            const gfx = this.scene.add.graphics();
            gfx.fillStyle(0xffffff, 1);
            gfx.fillRect(0, 0, 4, 4);
            gfx.generateTexture('weather-particle', 4, 4);
            gfx.destroy();
        }
    }

    setWeather(type) {
        this.currentWeather = type;
        this.stopAllEffects();

        switch (type) {
            case WEATHER_TYPES.RAIN:
                this.startRain();
                break;
            case WEATHER_TYPES.SNOW:
                this.startSnow();
                break;
            case WEATHER_TYPES.SANDSTORM:
                this.startSandstorm();
                break;
            // Add other types as needed
        }
    }

    stopAllEffects() {
        Object.values(this.emitters).forEach(emitter => {
            emitter.stop();
            // Give time for particles to disappear before destroying? 
            // For now just stop emitting.
            // emitter.killAll(); // If supported
        });
        // Clear emitters list if we want to recreate them
        this.emitters = {};
        // Actually better to destroy old emitters to clean up
        this.particleManager.emitters.getAll().forEach(e => e.remove());
    }

    startRain() {
        const { width, height } = this.scene.scale;
        const emitter = this.particleManager.createEmitter({
            x: { min: -100, max: width + 100 },
            y: -50,
            lifespan: 1000,
            speedY: { min: 400, max: 600 },
            speedX: { min: -20, max: 20 },
            scale: 0.5,
            quantity: 4,
            frequency: 10,
            tint: 0xaadaff,
            alpha: 0.6,
            blendMode: 'ADD',
        });
        this.emitters.rain = emitter;

        // Camera tint/overlay could be handled here too
        this.scene.cameras.main.setBackgroundColor(0x555555); // Darker sky
    }

    startSnow() {
        const { width, height } = this.scene.scale;
        const emitter = this.particleManager.createEmitter({
            x: { min: -100, max: width + 100 },
            y: -50,
            lifespan: 3000,
            speedY: { min: 50, max: 100 },
            speedX: { min: -20, max: 20 },
            scale: { start: 0.8, end: 0.4 },
            quantity: 2,
            frequency: 50,
            tint: 0xffffff,
            alpha: 0.8,
        });
        this.emitters.snow = emitter;
    }

    startSandstorm() {
        const { width, height } = this.scene.scale;
        const emitter = this.particleManager.createEmitter({
            x: width + 50,
            y: { min: 0, max: height },
            lifespan: 2000,
            speedX: { min: -600, max: -400 },
            speedY: { min: -50, max: 50 },
            scale: { start: 1, end: 0.5 },
            quantity: 5,
            frequency: 20,
            tint: 0xd2b48c, // Tan color
            alpha: 0.6,
        });
        this.emitters.sandstorm = emitter;
    }

    update() {
        // If we need to scroll particles with camera, usually emitters handle it if setScrollFactor(0) 
        // But since they are mostly screen-space effects, we might want them fixed to camera?
        // In Phaser 3, setting scroll factor on manager affects all.
        // Let's assume weather is global/screen-space.
        this.particleManager.setScrollFactor(0);
    }

    destroy() {
        if (this.unsubscribe) this.unsubscribe();
        if (this.particleManager) this.particleManager.destroy();
    }
}

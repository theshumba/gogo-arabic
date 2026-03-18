import { MOUNT_TYPES } from '../../data/transport.js';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';

export class MountSystem {
    constructor(scene) {
        this.scene = scene;
        this.currentMount = null;
        this.isMounted = false;
    }

    // Called when player interacts with a mount item or uses a mount skill
    mount(mountId) {
        const mountType = MOUNT_TYPES[mountId];
        if (!mountType) {
            console.warn(`Unknown mount type: ${mountId}`);
            return;
        }

        if (this.isMounted) {
            this.dismount();
            return;
        }

        // Check conditions (e.g. outdoors only)
        if (this.scene.scene.key === 'InteriorScene') {
            EventBus.emit(EVENTS.SHOW_NOTIFICATION, {
                message: "Cannot mount indoors!",
                type: 'error'
            });
            return;
        }

        this.currentMount = mountType;
        this.isMounted = true;

        // Apply speed boost
        if (this.scene.playerController) {
            this.scene.playerController.setSpeedMultiplier(mountType.speedMultiplier);

            // Change player sprite/texture
            // For now, let's just use a tint or a simple scale change to indicate mounting
            // In a real implementation, we'd swap the sprite texture or play a different animation
            const player = this.scene.playerController.getPlayer();
            if (player) {
                player.setTint(0xddddff); // Visual indicator
                player.setScale(1.2);     // Visual indicator
                // If we have assets: player.setTexture(mountType.assetKey);
            }
        }

        EventBus.emit(EVENTS.SHOW_NOTIFICATION, {
            message: `Mounted ${mountType.name}`,
            type: 'info'
        });
    }

    dismount() {
        if (!this.isMounted) return;

        this.isMounted = false;
        this.currentMount = null;

        if (this.scene.playerController) {
            this.scene.playerController.setSpeedMultiplier(1.0); // Reset speed

            const player = this.scene.playerController.getPlayer();
            if (player) {
                player.clearTint();
                player.setScale(1.0);
                // Reset texture if changed
            }
        }
    }

    update() {
        // Handle mount-specific logic per frame if needed
        // e.g. particle effects for dust when running
    }

    destroy() {
        if (this.isMounted) {
            this.dismount();
        }
    }
}

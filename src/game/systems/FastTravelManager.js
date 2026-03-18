import { FAST_TRAVEL_NODES } from '../../data/transport.js';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';

export class FastTravelManager {
    constructor(scene) {
        this.scene = scene;
        this.worldStateManager = scene.worldStateManager;
    }

    unlockNode(nodeId) {
        if (!this.worldStateManager) return;

        const flagKey = `ft_unlocked_${nodeId}`;
        if (!this.worldStateManager.getFlag(flagKey)) {
            this.worldStateManager.setFlag(flagKey, true);

            // Notify UI unlock
            EventBus.emit(EVENTS.SHOW_NOTIFICATION, {
                message: `Fast Travel Unlocked: ${FAST_TRAVEL_NODES[nodeId].name}`,
                type: 'success'
            });
        }
    }

    isNodeUnlocked(nodeId) {
        if (!this.worldStateManager) return false;
        return !!this.worldStateManager.getFlag(`ft_unlocked_${nodeId}`);
    }

    getUnlockedNodes() {
        return Object.values(FAST_TRAVEL_NODES).filter(node => this.isNodeUnlocked(node.id));
    }

    fastTravel(nodeId) {
        const node = FAST_TRAVEL_NODES[nodeId];
        if (!node) return;

        if (!this.isNodeUnlocked(nodeId)) {
            console.warn(`Fast travel node ${nodeId} is locked.`);
            return;
        }

        // Check if we are already in the target zone
        if (this.scene.currentZone === node.zone) {
            // Just teleport player
            const player = this.scene.playerController.getPlayer();
            if (player) {
                player.setPosition(node.x * 64, node.y * 64); // Assuming TILE=64, import TILE if needed
                // Visual effect
                this.scene.handleVfxBurst({ x: player.x, y: player.y, config: { color: 0x00ffff, count: 20 } });
            }
        } else {
            // Trigger zone transition
            // We can reuse loadZone but better to use zoneTransition system if it supports coordinates
            // If zoneTransition.transitionToZone(zoneName, entryName) exists, we might need a custom entry or coordinate support.
            // Let's modify WorldScene to support coordinate loading directly via loadZone if simpler,
            // or modify zoneTransition.

            // For now, let's call loadZone directly on scene, simulating a transition
            this.scene.cameras.main.fadeOut(500, 0, 0, 0);
            this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.loadZone(node.zone, node.x * 64, node.y * 64);
                this.scene.cameras.main.fadeIn(500, 0, 0, 0);
            });
        }
    }

    // Check current location to unlock nodes (called periodically or on zone entry)
    checkCurrentLocation(x, y, zoneId) {
        // optimization: only check nodes in current zone
        const zoneNodes = Object.values(FAST_TRAVEL_NODES).filter(n => n.zone === zoneId);

        for (const node of zoneNodes) {
            const dx = node.x * 64 - x;
            const dy = node.y * 64 - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 200) { // Unlock range
                this.unlockNode(node.id);
            }
        }
    }

    travelToZone(zoneId) {
        // Find the primary node for this zone
        const node = Object.values(FAST_TRAVEL_NODES).find(n => n.zone === zoneId);
        if (node) {
            // If node exists, use its specific location
            this.fastTravel(node.id);
        } else {
            // Fallback: just load the zone at default spawn
            this.scene.loadZone(zoneId);
        }
    }
}

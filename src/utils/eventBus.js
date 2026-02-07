import Phaser from 'phaser';

// Canonical location for the shared event emitter.
// Phaser scenes emit events (e.g. 'npc-interact'), React listens.
// React emits events (e.g. 'quiz-complete'), Phaser scenes listen.
export const EventBus = new Phaser.Events.EventEmitter();

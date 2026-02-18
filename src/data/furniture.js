/**
 * Furniture Registry
 * Defines interactive objects found in interiors and their associated vocabulary categories.
 */

export const FURNITURE = {
    // Bookshelves (Vocabulary Learning)
    bookshelf: {
        type: 'bookshelf',
        labelArabic: 'مَكتَبَة',
        labelEnglish: 'Bookshelf',
        description: 'A collection of books and scrolls.',
        interactionType: 'vocabulary',
    },

    // Lanterns (Small discrete vocab)
    lantern: {
        type: 'lantern',
        labelArabic: 'فانوس',
        labelEnglish: 'Lantern',
        description: 'A traditional lantern providing warm light.',
        interactionType: 'vocabulary_single',
    },

    // Pots (Cultural context / Single words)
    pot: {
        type: 'pot',
        labelArabic: 'قِدر',
        labelEnglish: 'Pot',
        description: 'A clay pot used for cooking or storage.',
        interactionType: 'vocabulary_single',
    },

    // Chests (Loot)
    chest: {
        type: 'chest',
        labelArabic: 'صندوق',
        labelEnglish: 'Chest',
        description: 'A sturdy wooden chest.',
        interactionType: 'loot',
    },

    // Barrels (Trade goods)
    barrel: {
        type: 'barrel',
        labelArabic: 'برميل',
        labelEnglish: 'Barrel',
        description: 'A barrel for storing goods.',
        interactionType: 'vocabulary_single',
    },

    // Crates (Trade goods)
    crate: {
        type: 'crate',
        labelArabic: 'صندوق خَشَبي',
        labelEnglish: 'Crate',
        description: 'A wooden crate for transport.',
        interactionType: 'loot',
    },

    // Paintings (Cultural Notes)
    painting: {
        type: 'painting',
        labelArabic: 'لوحة',
        labelEnglish: 'Painting',
        description: 'A decorative artwork.',
        interactionType: 'cultural_note',
    },
};

export const VOCAB_CATEGORIES = [
    'greetings',
    'numbers',
    'colors',
    'days',
    'family',
    'food',
    'animals',
    'nature',
    'directions',
    'feelings',
    'verbs',
    'adjectives',
    'places',
    'weather',
    'time',
    'clothing',
    'body',
    'home',
    'school',
    'jobs',
];

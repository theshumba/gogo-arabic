/**
 * Transport Registry
 * Defines fast travel nodes and their locations within zones.
 */

export const FAST_TRAVEL_NODES = {
    // Zone 1: Oasis Village
    oasis_square: {
        id: 'oasis_square',
        zone: 'oasis_village',
        x: 20, // Tile coordinates
        y: 14,
        name: 'Village Square',
        nameArabic: 'ساحة القرية',
        unlockCondition: { type: 'visit' }, // Unlocks upon visiting the zone/area
    },

    // Zone 2: Ancient Library
    library_gate: {
        id: 'library_gate',
        zone: 'ancient_library',
        x: 17,
        y: 27,
        name: 'Library Gate',
        nameArabic: 'بوابة المكتبة',
        unlockCondition: { type: 'visit' },
    },

    // Zone 3: Desert Marketplace
    market_center: {
        id: 'market_center',
        zone: 'desert_marketplace',
        x: 22,
        y: 17,
        name: 'Market Center',
        nameArabic: 'وسط السوق',
        unlockCondition: { type: 'visit' },
    },

    // Zone 4: Farmland
    farm_crossroads: {
        id: 'farm_crossroads',
        zone: 'farmland',
        x: 22,
        y: 17, // Approx center path
        name: 'Farm Crossroads',
        nameArabic: 'مفترق المزرعة',
        unlockCondition: { type: 'visit' },
    },

    // Zone 5: Bedouin Camp
    bedouin_fire: {
        id: 'bedouin_fire',
        zone: 'bedouin_camp',
        x: 17,
        y: 13,
        name: 'Campfire',
        nameArabic: 'نار المخيم',
        unlockCondition: { type: 'visit' },
    },

    // Zone 6: Mountain Village
    mountain_peak: {
        id: 'mountain_peak',
        zone: 'mountain_village',
        x: 20,
        y: 20, // Near healer/weaver
        name: 'Mountain Peak',
        nameArabic: 'قمة الجبل',
        unlockCondition: { type: 'visit' },
    },

    // Zone 7: Coastal Port
    port_docks: {
        id: 'port_docks',
        zone: 'coastal_port',
        x: 33,
        y: 17,
        name: 'Port Docks',
        nameArabic: 'رصيف الميناء',
        unlockCondition: { type: 'visit' },
    },
};

export const MOUNT_TYPES = {
    camel: {
        id: 'camel',
        name: 'Camel',
        speedMultiplier: 1.5,
        assetKey: 'mount-camel',
    },
    horse: {
        id: 'horse',
        name: 'Arabian Horse',
        speedMultiplier: 1.8,
        assetKey: 'mount-horse',
    },
    boat: {
        id: 'boat',
        name: 'Dhow',
        speedMultiplier: 1.2,
        assetKey: 'mount-boat',
        waterOnly: true,
    },
};

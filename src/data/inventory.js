/**
 * initialInventory
 * Hardcoded mock data to seed the application.
 */
const initialInventory = [
    {
        id: "P-101",
        name: "M3 Hex Nut",
        stockThreshold: 50, // Optional: for low stock warnings logic later
        locations: [
            { cabinetIndex: 1, drawerIndex: 1, qty: 100 },
            { cabinetIndex: 2, drawerIndex: 5, qty: 50 }
        ]
    },
    {
        id: "P-102",
        name: "M5 Bolt 20mm",
        locations: [
            { cabinetIndex: 1, drawerIndex: 2, qty: 30 }
        ]
    },
    {
        id: "P-103",
        name: "Washer 1/4 inch",
        locations: [
            { cabinetIndex: 3, drawerIndex: 1, qty: 200 }
        ]
    }
];

const STORAGE_KEY = 'qr-inventory-data';

/**
 * getInventory
 * Retrieves inventory from localStorage or returns initial mock data.
 */
export const getInventory = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        // Initialize if empty
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialInventory));
        return initialInventory;
    } catch (e) {
        console.error("Failed to load inventory", e);
        return initialInventory;
    }
};

/**
 * saveInventory
 * Saves the current inventory state to localStorage.
 */
export const saveInventory = (inventory) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    } catch (e) {
        console.error("Failed to save inventory", e);
    }
};

/**
 * updatePartStock
 * Updates the stock for a specific part in a specific location.
 * Defines location by cabinetIndex and drawerIndex.
 */
export const updatePartStock = (partId, cabinetIdx, drawerIdx, newQty) => {
    const inventory = getInventory();
    const partIndex = inventory.findIndex(p => p.id === partId);

    if (partIndex === -1) return inventory; // Part not found

    const part = { ...inventory[partIndex] };
    const locIndex = part.locations.findIndex(
        l => l.cabinetIndex === cabinetIdx && l.drawerIndex === drawerIdx
    );

    if (locIndex !== -1) {
        // Update existing location
        const newLocations = [...part.locations];
        newLocations[locIndex] = { ...newLocations[locIndex], qty: newQty };

        // If qty is 0, arguably we could remove the location, but let's keep it for now
        // so user can add back to it easily. OR we removing if 0?
        // Requirement implies "Take 1", so going to 0 is possible.
        // Let's keep it.

        part.locations = newLocations;
    } else {
        // Add new location if qty > 0
        if (newQty > 0) {
            part.locations = [...part.locations, { cabinetIndex: cabinetIdx, drawerIndex: drawerIdx, qty: newQty }];
        }
    }

    const newInventory = [...inventory];
    newInventory[partIndex] = part;

    saveInventory(newInventory);
    return newInventory;
};

/**
 * getPartById
 * Helper to find a wrapper matching the ID.
 */
export const getPartById = (inventory, id) => {
    return inventory.find(p => p.id === id);
};

/**
 * getTotalStock
 * Helper to sum up all locations.
 */
export const getTotalStock = (part) => {
    if (!part || !part.locations) return 0;
    return part.locations.reduce((acc, loc) => acc + loc.qty, 0);
};

/**
 * initialInventory
 * Hardcoded mock data to seed the application.
 */
const initialInventory = [
    {
        id: "H-100",
        name: "Karaj",
        stockThreshold: 1, // Optional: for low stock warnings logic later
        locations: [
            { cabinetIndex: 1, drawerIndex: 1, qty: 13 },
        ]
    },
    {
        id: "H-101",
        name: "Csülök",
        stockThreshold: 1, // Optional: for low stock warnings logic later
        locations: [
            { cabinetIndex: 1, drawerIndex: 12, qty: 3 },
        ]
    },
    {
        id: "H-102",
        name: "Szűzpecsenye",
        stockThreshold: 1, // Optional: for low stock warnings logic later
        locations: [
            { cabinetIndex: 1, drawerIndex: 5, qty: 2 },
        ]
    },
    {
        id: "H-103",
        name: "Oldalas",
        stockThreshold: 1, // Optional: for low stock warnings logic later
        locations: [
            { cabinetIndex: 2, drawerIndex: 5, qty: 5 },
        ]
    },
    {
        id: "H-104",
        name: "Lapocka",
        stockThreshold: 1, // Optional: for low stock warnings logic later
        locations: [
            { cabinetIndex: 2, drawerIndex: 5, qty: 6 },
        ]
    },
    {
        id: "ZGY-100",
        name: "Cseresznye",
        locations: [
            { cabinetIndex: 3, drawerIndex: 2, qty: 5 }
        ]
    },
    {
        id: "ZGY-101",
        name: "Paprika",
        locations: [
            { cabinetIndex: 3, drawerIndex: 2, qty: 10 }
        ]
    },
    {
        id: "A-100",
        name: "Jack Daniels",
        locations: [
            { cabinetIndex: 3, drawerIndex: 1, qty: 200 }
        ]
    },
    {
        id: "A-101",
        name: "Málna pálinka",
        locations: [
            { cabinetIndex: 3, drawerIndex: 1, qty: 1 }
        ]
    }
];

// Google Apps Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbyAuFLau4Go0JvyggKznsnjZK1yK1zyiOE054fQMndTd9GduHrG4YvevWL3dnkbC9T6gA/exec";

/**
 * syncPartToRemote
 * Uploads a single item to the Google Sheet.
 */
const syncPartToRemote = async (part) => {
    try {
        await fetch(`${API_URL}?action=update`, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
                id: part.id,
                name: part.name,
                stockThreshold: part.stockThreshold,
                locations: part.locations
            })
        });
    } catch (e) {
        console.error("Failed to sync part to remote", part.id, e);
    }
};

/**
 * seedRemoteInventory
 * Pushes all items from initialInventory to the remote sheet.
 */
const seedRemoteInventory = async () => {
    console.log("Seeding remote inventory...");
    // We execute these sequentially to avoid overwhelming the GAS lock/rate limits
    for (const item of initialInventory) {
        await syncPartToRemote(item);
        console.log("Seeded:", item.id);
    }
    console.log("Seeding complete.");
};

/**
 * fetchInventory
 * Fetches inventory from Google Sheets and merges with local definitions.
 */
export const fetchInventory = async () => {
    try {
        const response = await fetch(`${API_URL}?action=read`);
        const data = await response.json();

        // If sheet is empty or error, default to initial
        if (!Array.isArray(data)) {
            console.warn("API returned invalid data, using default.");
            return initialInventory;
        }

        if (data.length === 0) {
            console.log("Sheet empty, using default and auto-seeding.");
            // Trigger background seed - do not await to keep UI fast
            seedRemoteInventory();
            return initialInventory;
        }

        // Map sheet data by ID for merging
        const sheetMap = new Map(data.map(item => [item.id, item]));

        // Merge: Master List (Code) + Stock Counts (Sheet)
        const mergedInventory = initialInventory.map(initialItem => {
            const sheetItem = sheetMap.get(initialItem.id);
            if (sheetItem) {
                // Determine valid locations from sheet, but maybe structure changed?
                // For now, trust the sheet's location data if ID matches.
                return { ...initialItem, locations: sheetItem.locations };
            }
            return initialItem; // New item in code not yet in sheet
        });

        return mergedInventory;
    } catch (e) {
        console.error("Failed to load inventory from API", e);
        return initialInventory; // Offline fallback
    }
};

/**
 * updatePartStock
 * Sends update to Google Sheet and returns the optimistically updated inventory.
 * NOW ASYNC.
 */
export const updatePartStock = async (currentInventory, partId, cabinetIdx, drawerIdx, newQty) => {
    const partIndex = currentInventory.findIndex(p => p.id === partId);
    if (partIndex === -1) return currentInventory;

    const part = { ...currentInventory[partIndex] };
    const locIndex = part.locations.findIndex(
        l => l.cabinetIndex === cabinetIdx && l.drawerIndex === drawerIdx
    );

    if (locIndex !== -1) {
        const newLocations = [...part.locations];
        newLocations[locIndex] = { ...newLocations[locIndex], qty: newQty };
        part.locations = newLocations;
    } else {
        if (newQty > 0) {
            part.locations = [...part.locations, { cabinetIndex: cabinetIdx, drawerIndex: drawerIdx, qty: newQty }];
        }
    }

    // Optimistic Update locally
    const newInventory = [...currentInventory];
    newInventory[partIndex] = part;

    // Send to Backend
    syncPartToRemote(part);

    return newInventory;
};

/**
 * getPartById
 */
export const getPartById = (inventory, id) => {
    return inventory.find(p => p.id === id);
};

/**
 * getTotalStock
 */
export const getTotalStock = (part) => {
    if (!part || !part.locations) return 0;
    return part.locations.reduce((acc, loc) => acc + loc.qty, 0);
};

/**
 * resetInventory
 * Sends init command to sheet and then re-seeds.
 */
export const resetInventory = async () => {
    try {
        console.log("Resetting inventory...");
        await fetch(`${API_URL}?action=init`);
        await seedRemoteInventory();
        window.location.reload();
    } catch (e) {
        console.error("Failed to reset inventory", e);
    }
};

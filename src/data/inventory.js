/**
 * initialInventory
 * Hardcoded mock data to seed the application.
 */
const initialInventory = [];

// Google Apps Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbyAuFLau4Go0JvyggKznsnjZK1yK1zyiOE054fQMndTd9GduHrG4YvevWL3dnkbC9T6gA/exec";


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
            console.log("Sheet empty.");
            return [];
        }

        // Since initialInventory is empty, we now rely 100% on the sheet data.
        return data;
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


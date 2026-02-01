import React, { useState } from 'react';

const ManualControls = ({ currentLocation, onUpdate }) => {
    const [amount, setAmount] = useState(0);
    const [cabinet, setCabinet] = useState(currentLocation?.cabinetIndex || 1);
    const [drawer, setDrawer] = useState(currentLocation?.drawerIndex || 1);

    // Update local state if prop changes (optional, might need effect)
    React.useEffect(() => {
        if (currentLocation) {
            setCabinet(currentLocation.cabinetIndex);
            setDrawer(currentLocation.drawerIndex);
        }
    }, [currentLocation]);

    const handleUpdate = () => {
        onUpdate(parseInt(amount), { cabinetIndex: parseInt(cabinet), drawerIndex: parseInt(drawer) });
        setAmount(0); // Reset amount after update
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Manual Adjustment</h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Cabinet #</label>
                    <input
                        type="number"
                        value={cabinet}
                        onChange={(e) => setCabinet(e.target.value)}
                        className="w-full p-2 border rounded text-center"
                        min="1"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Drawer #</label>
                    <input
                        type="number"
                        value={drawer}
                        onChange={(e) => setDrawer(e.target.value)}
                        className="w-full p-2 border rounded text-center"
                        min="1"
                    />
                </div>
            </div>

            <div className="flex gap-3 items-end">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Set Qty To</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="New Qty"
                    />
                </div>
                <button
                    onClick={handleUpdate}
                    className="bg-blue-600 text-white px-4 py-2 rounded font-semibold active:bg-blue-700 h-[42px]"
                >
                    Update
                </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
                "Update" sets the absolute quantity for the specified location.
            </p>
        </div>
    );
};

export default ManualControls;

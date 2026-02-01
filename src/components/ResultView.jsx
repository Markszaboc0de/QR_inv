import React, { useState, useEffect } from 'react';
import ManualControls from './ManualControls';
import QuickActions from './QuickActions';
import { getTotalStock } from '../data/inventory';

const ResultView = ({ part, onBack, onUpdateStock }) => {
    // Default to first location or a default if empty
    const [targetLocation, setTargetLocation] = useState(
        part.locations[0] || { cabinetIndex: 1, drawerIndex: 1, qty: 0 }
    );

    // Sync state if part changes
    useEffect(() => {
        if (part.locations.length > 0) {
            setTargetLocation(part.locations[0]);
        }
    }, [part]);

    // Derived qty for current target
    const currentLocData = part.locations.find(
        l => l.cabinetIndex === targetLocation.cabinetIndex &&
            l.drawerIndex === targetLocation.drawerIndex
    );
    const currentQty = currentLocData ? currentLocData.qty : 0;
    const totalStock = getTotalStock(part);

    const handleManualUpdate = (amount, location) => {
        // "Amount" in Manual Controls is likely an absolute SET or an ADD?
        // Prompt says "Inputs to manually set a specific 'Amount'".
        // "Update button to apply these specific changes."
        // Usually "Amount" implies absolute set. 
        // Let's assume SET.
        onUpdateStock(part.id, location.cabinetIndex, location.drawerIndex, amount);

        // Update local view target
        setTargetLocation({ ...location, qty: amount });
    };

    const handleQuickAction = (delta) => {
        const newQty = Math.max(0, currentQty + delta);
        onUpdateStock(part.id, targetLocation.cabinetIndex, targetLocation.drawerIndex, newQty);
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 bg-white min-h-screen sm:min-h-0 sm:rounded-xl sm:shadow-md flex flex-col">
            <button
                onClick={onBack}
                className="self-start text-blue-600 mb-4 flex items-center gap-1 text-sm font-medium"
            >
                &larr; Scan Another
            </button>

            {/* Part Info */}
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{part.name}</h1>
                <p className="text-sm text-gray-500 mb-2">ID: {part.id}</p>
                <div className="flex justify-center items-center gap-4 mt-2">
                    <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                        <span className="block text-xs text-blue-500 uppercase font-bold tracking-wider">Total Stock</span>
                        <span className="text-2xl font-bold text-blue-700">{totalStock}</span>
                    </div>
                    <div className="bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-100">
                        <span className="block text-xs text-yellow-600 uppercase font-bold tracking-wider">Location</span>
                        <span className="text-xl font-bold text-yellow-800">
                            ({targetLocation.cabinetIndex} / {targetLocation.drawerIndex})
                        </span>
                    </div>
                </div>
            </div>

            {/* Manual Controls */}
            <ManualControls
                currentLocation={targetLocation}
                onUpdate={handleManualUpdate}
            />

            {/* Quick Actions */}
            <QuickActions
                locationLabel={`(${targetLocation.cabinetIndex} / ${targetLocation.drawerIndex})`}
                onIncrement={() => handleQuickAction(1)}
                onDecrement={() => handleQuickAction(-1)}
            />

            {/* Current Qty Display (optional helper) */}
            <div className="mt-4 text-center text-sm text-gray-400">
                Qty in this drawer: <span className="font-semibold text-gray-600">{currentQty}</span>
            </div>
        </div>
    );
};

export default ResultView;

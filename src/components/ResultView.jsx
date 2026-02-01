import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ManualControls from './ManualControls';
import QuickActions from './QuickActions';
import { getTotalStock } from '../data/inventory';

const ResultView = ({ inventory, onUpdateStock }) => {
    const { partId } = useParams();
    const navigate = useNavigate();

    // Find the part from the passed inventory prop
    const part = inventory.find(p => p.id === partId);

    // Local state for target location (default to first or 1/1)
    const [targetLocation, setTargetLocation] = useState({ cabinetIndex: 1, drawerIndex: 1, qty: 0 });

    // Sync state when part loads or changes
    useEffect(() => {
        if (part && part.locations.length > 0) {
            setTargetLocation(part.locations[0]);
        }
    }, [part]);

    // Derived qty for current target
    const currentLocData = part?.locations.find(
        l => l.cabinetIndex === targetLocation.cabinetIndex &&
            l.drawerIndex === targetLocation.drawerIndex
    );
    const currentQty = currentLocData ? currentLocData.qty : 0;
    const totalStock = part ? getTotalStock(part) : 0;

    const handleManualUpdate = (amount, location) => {
        if (!part) return;
        onUpdateStock(part.id, location.cabinetIndex, location.drawerIndex, amount);
        setTargetLocation({ ...location, qty: amount });
    };

    const handleQuickAction = (delta) => {
        if (!part) return;
        const newQty = Math.max(0, currentQty + delta);
        onUpdateStock(part.id, targetLocation.cabinetIndex, targetLocation.drawerIndex, newQty);
    };

    const handleBack = () => {
        navigate('/');
    };

    const handleLocationSelect = (loc) => {
        setTargetLocation(loc);
    };

    const handleAddNewLocation = () => {
        // Default to a likely next drawer? Or just 1/1
        // Let's assume 1/1 for simplicity, user changes it.
        // We use a temporary object that isn't in the list strictly speaking until saved.
        setTargetLocation({ cabinetIndex: 1, drawerIndex: 1, qty: 0 });
    };

    if (!part) {
        return (
            <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-md text-center">
                <h2 className="text-xl font-bold text-red-600 mb-2">Alkatrész Nem Található</h2>
                <p className="text-gray-500 mb-6">ID: {partId}</p>
                <button
                    onClick={handleBack}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold mb-4"
                >
                    Vissza a Szkenerhez
                </button>

                <div className="border-t pt-4">
                    <p className="text-sm text-gray-500 mb-2">Nem látod az új tételeket?</p>
                    <button
                        onClick={() => {
                            if (confirm('Ez töröl minden egyéni változtatást és újratölti az alap adatbázist. Folytatja?')) {
                                import('../data/inventory').then(mod => mod.resetInventory());
                            }
                        }}
                        className="text-red-500 underline text-sm"
                    >
                        Adatbázis Visszaállítása
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto p-4 bg-white min-h-screen sm:min-h-0 sm:rounded-xl sm:shadow-md flex flex-col">
            <button
                onClick={handleBack}
                className="self-start text-blue-600 mb-4 flex items-center gap-1 text-sm font-medium"
            >
                &larr; Következő Beolvasása
            </button>

            {/* Part Info */}
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{part.name}</h1>
                <p className="text-sm text-gray-500 mb-2">ID: {part.id}</p>
                <div className="flex justify-center items-center gap-4 mt-2">
                    <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                        <span className="block text-xs text-blue-500 uppercase font-bold tracking-wider">Teljes Készlet</span>
                        <span className="text-2xl font-bold text-blue-700">{totalStock}</span>
                    </div>
                </div>
            </div>

            {/* Location List */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 ml-1">Készlet Helyek</h3>
                <div className="space-y-2">
                    {part.locations.map((loc, idx) => (
                        <div
                            key={`${loc.cabinetIndex}-${loc.drawerIndex}`}
                            onClick={() => handleLocationSelect(loc)}
                            className={`p-3 rounded-lg border flex justify-between items-center cursor-pointer transition-colors ${loc.cabinetIndex === targetLocation.cabinetIndex && loc.drawerIndex === targetLocation.drawerIndex
                                ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-gray-700 font-medium">Hűtő {loc.cabinetIndex} / Fiók {loc.drawerIndex}</span>
                            <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-sm">{loc.qty}</span>
                        </div>
                    ))}

                    <button
                        onClick={handleAddNewLocation}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm font-medium hover:border-blue-400 hover:text-blue-500 transition-colors"
                    >
                        + Új Hely Hozzáadása
                    </button>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Szerkesztés: </span>
                    <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                        ({targetLocation.cabinetIndex} / {targetLocation.drawerIndex})
                    </span>
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
                {/* Current Qty Display */}
                <div className="mt-4 text-center text-sm text-gray-400 border-t border-gray-200 pt-3">
                    Mennyiség itt: <span className="font-semibold text-gray-600">{currentQty}</span>
                </div>
            </div>
        </div>
    );
};

export default ResultView;

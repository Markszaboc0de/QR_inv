import React, { useState, useEffect } from 'react';
import Scanner from './components/Scanner';
import ResultView from './components/ResultView';
import { getInventory, updatePartStock, getPartById } from './data/inventory';

function App() {
  const [inventory, setInventory] = useState([]);
  const [currentPart, setCurrentPart] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [view, setView] = useState('SCAN'); // 'SCAN' | 'RESULT'

  useEffect(() => {
    // Load initial data
    setInventory(getInventory());
  }, []);

  const handleScanSuccess = (decodedText) => {
    // Attempt to finding part
    const part = getPartById(inventory, decodedText);

    // Some scanners might return raw text, trimming is safe
    const cleanId = decodedText.trim();
    const foundPart = inventory.find(p => p.id === cleanId);

    if (foundPart) {
      setCurrentPart(foundPart);
      setScanError(null);
      setView('RESULT');
    } else {
      setScanError(`Unknown Part ID: ${cleanId}`);
    }
  };

  const handleUpdateStock = (partId, cabinetIdx, drawerIdx, newQty) => {
    const updatedInventory = updatePartStock(partId, cabinetIdx, drawerIdx, newQty);
    setInventory(updatedInventory);

    // Update local currentPart reference so UI refreshes
    const updatedPart = updatedInventory.find(p => p.id === partId);
    setCurrentPart(updatedPart);
  };

  const handleBack = () => {
    setScanError(null);
    setView('SCAN');
    setCurrentPart(null);
  };

  // Skip rendering scanner if not in SCAN mode to save resources? 
  // actually html5-qrcode implementation handles mount/unmount.

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      {view === 'SCAN' && (
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8 text-blue-900">Inventory Scanner</h1>
          <Scanner
            onScanSuccess={handleScanSuccess}
            onScanFailure={(err) => { /* ignore minor scan errors */ }}
          />

          {/* Debug / Fallback Input for Testing without Camera */}
          <div className="mt-8 p-4 bg-white rounded-lg shadow opacity-80">
            <p className="text-xs text-center text-gray-400 mb-2">Debug Manual Entry</p>
            <input
              type="text"
              placeholder="Enter ID (e.g. P-101)"
              className="w-full border p-2 rounded text-center"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleScanSuccess(e.currentTarget.value);
              }}
            />
          </div>

          {scanError && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center font-medium border border-red-200">
              {scanError}
            </div>
          )}
        </div>
      )}

      {view === 'RESULT' && currentPart && (
        <ResultView
          part={currentPart}
          onBack={handleBack}
          onUpdateStock={handleUpdateStock}
        />
      )}
    </div>
  );
}

export default App;

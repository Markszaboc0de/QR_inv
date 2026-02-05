import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import ResultView from './components/ResultView';
import { fetchInventory, updatePartStock, getPartById, syncPartToRemote, addPart } from './data/inventory';
import AddItem from './components/AddItem';
import Dashboard from './components/Dashboard';

// Wrapper component to handle scan logic with navigation

function App() {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchInventory().then(data => {
      setInventory(data);
      setIsLoading(false);
    });
  }, []);

  const handleUpdateStock = (partId, cabinetIdx, drawerIdx, newQty) => {
    // 1. Calculate new state immediately (Synchronous)
    const updatedInventory = updatePartStock(inventory, partId, cabinetIdx, drawerIdx, newQty);

    // 2. Update UI (Optimistic)
    setInventory(updatedInventory);

    // 3. Trigger Background Sync
    setIsSyncing(true);
    const updatedPart = updatedInventory.find(p => p.id === partId);
    if (updatedPart) {
      syncPartToRemote(updatedPart)
        .finally(() => setIsSyncing(false));
    } else {
      setIsSyncing(false);
    }
  };

  const handleAddPart = (newItem) => {
    // 1. Calculate new state immediately
    const updatedInventory = addPart(inventory, newItem);

    // 2. Update UI
    setInventory(updatedInventory);

    // 3. Trigger Background Sync
    setIsSyncing(true);
    syncPartToRemote(newItem)
      .finally(() => setIsSyncing(false));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Adatbázis Betöltése...</h2>
          <p className="text-sm text-gray-500 mt-2">Kapcsolódás a Google Táblázathoz</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter basename="/QR_inv">
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
        <Routes>
          <Route path="/" element={<AddItem inventory={inventory} onAdd={handleAddPart} />} />
          <Route path="/dashboard" element={<Dashboard inventory={inventory} />} />
          <Route
            path="/:partId"
            element={
              <ResultView
                inventory={inventory}
                onUpdateStock={handleUpdateStock}
                isSyncing={isSyncing}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

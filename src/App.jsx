import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Scanner from './components/Scanner';
import ResultView from './components/ResultView';
import { fetchInventory, updatePartStock, getPartById } from './data/inventory';

// Wrapper component to handle scan logic with navigation
const ScanPage = ({ inventory }) => {
  const navigate = useNavigate();
  const [scanError, setScanError] = useState(null);

  const handleScanSuccess = (decodedText) => {
    const cleanId = decodedText.trim();
    // Validate existence before navigating? 
    // The user wants deep links, so they might navigate to a link that doesn't exist yet.
    // But for scanning, we usually want to know if it's valid. 
    // Let's navigate regardless, and ResultView handles "Unknown Part".
    // OR: Check valid and error if not found?

    // User requested: "qr code would contain the link and the id like this: .../P-101"
    // So if they scan a raw ID "P-101", we go to /P-101.
    // If they scan a full URL "https://.../QR_inv/P-101", we need to extract ID?
    // The html5-qrcode scanner usually just gives the string content.

    let targetId = cleanId;
    // Handle specific full URL case if needed, but for now assume ID or relative.
    // If the QR code contains the full link, html5-qrcode returns the full link.
    if (cleanId.includes('/QR_inv/')) {
      const parts = cleanId.split('/QR_inv/');
      targetId = parts[1];
    }

    navigate(`/${targetId}`);
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-900">Leltár Szkener</h1>
      <Scanner
        onScanSuccess={handleScanSuccess}
        onScanFailure={(err) => { /* ignore minor scan errors */ }}
      />

      {/* Debug / Fallback Input */}
      <div className="mt-8 p-4 bg-white rounded-lg shadow opacity-80">
        <p className="text-xs text-center text-gray-400 mb-2">Kézi ID Bevitel (Teszt)</p>
        <input
          type="text"
          placeholder="ID Megadása (pl. P-101)"
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
  );
};

function App() {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInventory().then(data => {
      setInventory(data);
      setIsLoading(false);
    });
  }, []);

  const handleUpdateStock = (partId, cabinetIdx, drawerIdx, newQty) => {
    updatePartStock(inventory, partId, cabinetIdx, drawerIdx, newQty).then(updated => {
      setInventory(updated);
    });
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
          <Route path="/" element={<ScanPage inventory={inventory} />} />
          <Route
            path="/:partId"
            element={
              <ResultView
                inventory={inventory}
                onUpdateStock={handleUpdateStock}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

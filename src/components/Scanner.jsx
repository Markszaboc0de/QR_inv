import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Scanner = ({ onScanSuccess, onScanFailure }) => {
    const scannerRef = useRef(null);
    const [scannerInstance, setScannerInstance] = useState(null);

    useEffect(() => {
        // Prevent double initialization in React Strict Mode
        if (scannerInstance) return;

        try {
            const scanner = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                /* verbose= */ false
            );

            scanner.render(
                (decodedText) => {
                    onScanSuccess(decodedText);
                    scanner.clear(); // Stop scanning after success
                },
                (error) => {
                    if (onScanFailure) onScanFailure(error);
                }
            );

            setScannerInstance(scanner);
        } catch (err) {
            console.error("Scanner init error:", err);
            if (onScanFailure) onScanFailure(err);
        }

        // Cleanup function
        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear html5-qrcode scanner. ", error);
            });
        };
    }, []);

    return (
        <div className="w-full max-w-md mx-auto p-4 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-center mb-4 text-gray-800">Scan QR Code</h2>
            <div id="reader" className="w-full rounded-lg overflow-hidden"></div>
            <p className="text-sm text-gray-500 text-center mt-2">
                Point camera at a part QR code
            </p>
        </div>
    );
};

export default Scanner;

'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

const ScanQRPage = () => {
  const [scannedData, setScannedData] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER;
  const scannerRef = useRef(null); // Ref to hold scanner instance

  // Initialize QR Code Scanner
  const initializeScanner = () => {
    if (scannerRef.current) return; // Prevent multiple instances

    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: 250,
    });

    const successCallback = (decodedText, decodedResult) => {
      console.log(`QR Code detected: ${decodedText}`);
      scanner.clear(); // Stop scanning after success
      scannerRef.current = null; // Reset scanner reference
      setScannedData(decodedText);
      handleSubmit(decodedText);
    };

    const errorCallback = (errorMessage) => {
      // console.warn(`QR Code no match: ${errorMessage}`);
    };

    scanner.render(successCallback, errorCallback);
    scannerRef.current = scanner; // Save instance
  };

  useEffect(() => {
    initializeScanner();

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => console.error('Failed to clear QR scanner.', error));
        scannerRef.current = null;
      }
    };
  }, []);

  // API Submission
  const handleSubmit = async (qrData) => {
    setLoading(true);
    setMessage('');

    try {
      const localToken = localStorage.getItem('token');
      if (!localToken) {
        setMessage('Unauthorized: No token found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/events/scanQR`,
        { qrData },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localToken}`,
          },
          withCredentials: true,
        }
      );

      setMessage(response.data.message);
    } catch (error) {
      console.error('Error submitting QR:', error);
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to handle "Scan Again"
  const handleScanAgain = () => {
    setScannedData('');
    setMessage('');
    initializeScanner(); // Re-initialize scanner
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Scan QR Code</h2>

      {/* QR Reader */}
      {!scannedData && <div id="qr-reader" className="w-full max-w-md"></div>}

      {/* Scanned Data */}
      {scannedData && (
        <div className="mt-4 p-3 bg-gray-200 rounded-xl w-full max-w-md text-center">
          <p className="font-medium text-gray-800">Scanned QR: {scannedData}</p>
        </div>
      )}

      {/* API Message */}
      {message && (
        <div className="mt-4 p-3 bg-white border border-gray-300 rounded-xl w-full max-w-md text-center">
          <p className="font-semibold text-gray-700">{message}</p>
        </div>
      )}

      {loading && (
        <div className="mt-2 text-gray-500">
          <p>Processing...</p>
        </div>
      )}

      {/* Scan Again Button */}
      {scannedData && (
        <button
          onClick={handleScanAgain}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          Scan Again
        </button>
      )}
    </div>
  );
};

const page = () => {
  return (
    <div>
      <ScanQRPage />
    </div>
  );
};

export default page;

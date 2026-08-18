import React, { useState, useEffect } from 'react';
import './OfflineAlert.css';

export const OfflineAlert: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="offline-toast-pill" role="alert">
      <div className="offline-pulse-dot" />
      <span className="offline-text">
        <strong>Koneksi Terputus:</strong> Anda sedang dalam mode offline. Fitur transaksi mungkin tertunda.
      </span>
      <button onClick={() => window.location.reload()} className="offline-reload-btn">
        Coba Hubungkan
      </button>
    </div>
  );
};

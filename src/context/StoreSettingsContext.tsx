import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiService } from '../services/api';

export interface StoreSettings {
  // Profil Toko
  name: string;
  tagline: string;
  description: string;
  cityOrigin: string;
  address: string;

  // Kontak & Sosmed
  whatsapp: string;
  email: string;
  operatingHours: string;
  instagram: string;
  tiktok: string;
  facebook: string;

  // Stok & Inventori
  lowStockThreshold: number;
  outOfStockAction: 'hide' | 'badge';

  // Pengiriman
  couriers: {
    jne: boolean;
    jnt: boolean;
    sicepat: boolean;
    pos: boolean;
  };
  freeShippingEnabled: boolean;
  freeShippingMinAmount: number;
  packingDays: number;

  // Pembayaran
  paymentMethods: {
    qris: boolean;
    bca: boolean;
    bni: boolean;
    bri: boolean;
  };
  paymentExpiryHours: number;
  midtransEnvironment: 'sandbox' | 'production';
}

export const defaultStoreSettings: StoreSettings = {
  name: 'Kripik Tempe Lakstari',
  tagline: 'Renyah, Gurih & Asli Tradisional Malang',
  description: 'Produsen dan penjual kripik tempe aneka rasa berkualitas terbaik dengan bahan kedelai pilihan dari Malang, Jawa Timur.',
  cityOrigin: 'Kota Malang, Jawa Timur (65145)',
  address: 'Jl. Raya Kripik Tempe No. 88, Sanan, Kota Malang, Jawa Timur 65125',

  whatsapp: '628123456789',
  email: 'kontak@kripiktempelakstari.id',
  operatingHours: 'Senin - Sabtu: 08.00 - 17.00 WIB',
  instagram: 'kripiktempe.lakstari',
  tiktok: 'lakstari_official',
  facebook: 'Kripik Tempe Lakstari',

  lowStockThreshold: 10,
  outOfStockAction: 'badge',

  couriers: {
    jne: true,
    jnt: true,
    sicepat: true,
    pos: true,
  },
  freeShippingEnabled: true,
  freeShippingMinAmount: 100000,
  packingDays: 1,

  paymentMethods: {
    qris: true,
    bca: true,
    bni: true,
    bri: true,
  },
  paymentExpiryHours: 24,
  midtransEnvironment: 'sandbox',
};

interface StoreSettingsContextType {
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

export const StoreSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lakstari_store_settings');
      if (saved) {
        try {
          return { ...defaultStoreSettings, ...JSON.parse(saved) };
        } catch {
          return defaultStoreSettings;
        }
      }
    }
    return defaultStoreSettings;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const serverSettings = await apiService.getStoreSettings();
      if (serverSettings) {
        const merged = { ...defaultStoreSettings, ...serverSettings };
        setSettings(merged);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lakstari_store_settings', JSON.stringify(merged));
        }
      }
    } catch (err) {
      console.warn('Gagal memuat pengaturan dari server, menggunakan data lokal / default:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<StoreSettings>): Promise<boolean> => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lakstari_store_settings', JSON.stringify(merged));
    }

    try {
      const success = await apiService.updateStoreSettings(merged);
      return success;
    } catch (err) {
      console.error('Gagal sinkronisasi pengaturan ke server:', err);
      return true; // Tetap berhasil tersimpan di local
    }
  };

  return (
    <StoreSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        refreshSettings: fetchSettings,
        isLoading,
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error('useStoreSettings harus digunakan di dalam StoreSettingsProvider');
  }
  return context;
};

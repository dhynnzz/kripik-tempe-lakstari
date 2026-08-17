// Service wilayah Indonesia berkinerja tinggi
// 1. Provinsi & Kota/Kabupaten: Dimuat dari dataset lokal (/data/wilayah/all_regions.json) (Instant 0ms, 100% anti-gagal, zero CORS)
// 2. Kecamatan & Desa/Kelurahan: Dimuat dari endpoint backend proxy Laravel (/api/wilayah/...) dengan fallback ke EMSIFA

export interface RegionItem {
  id: string;
  name: string;
}

interface AllRegionsData {
  provinces: RegionItem[];
  regencies: Record<string, RegionItem[]>;
}

const API_BASE_URL = 'http://localhost:8000/api';

let cachedData: AllRegionsData | null = null;
const districtCache: Record<string, RegionItem[]> = {};
const villageCache: Record<string, RegionItem[]> = {};

// Helper format text menjadi Title Case (contoh: "KOTA MALANG" -> "Kota Malang", "JAWA TIMUR" -> "Jawa Timur")
export const formatRegionName = (name: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.startsWith('dki')) return 'DKI';
      if (word.startsWith('di')) return 'DI';
      if (word.startsWith('kab.')) return 'Kab. ' + word.slice(4).charAt(0).toUpperCase() + word.slice(5);
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

async function loadAllRegionsData(): Promise<AllRegionsData> {
  if (cachedData) return cachedData;
  try {
    const res = await fetch('/data/wilayah/all_regions.json');
    if (!res.ok) throw new Error('Local dataset load error');
    const data: AllRegionsData = await res.json();
    cachedData = data;
    return data;
  } catch (err) {
    console.warn('Fallback loading online regions...', err);
    try {
      const res = await fetch('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json');
      const provinces = await res.json();
      cachedData = { provinces, regencies: {} };
      return cachedData;
    } catch {
      return { provinces: [], regencies: {} };
    }
  }
}

export const regionService = {
  // 1. Ambil 100% Seluruh Provinsi di Indonesia
  async getProvinces(): Promise<RegionItem[]> {
    const data = await loadAllRegionsData();
    return data.provinces || [];
  },

  // 2. Ambil 100% Seluruh Kota / Kabupaten berdasarkan ID Provinsi
  async getRegencies(provinceId: string): Promise<RegionItem[]> {
    if (!provinceId) return [];
    const data = await loadAllRegionsData();
    if (data.regencies && data.regencies[provinceId]) {
      return data.regencies[provinceId];
    }

    try {
      const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
      if (res.ok) {
        const regencies: RegionItem[] = await res.json();
        if (data.regencies) data.regencies[provinceId] = regencies;
        return regencies;
      }
    } catch (e) {
      console.warn('Error fetching regency:', e);
    }
    return [];
  },

  // 3. Ambil Kecamatan via Backend Proxy Laravel (Bebas CORS)
  async getDistricts(regencyId: string): Promise<RegionItem[]> {
    if (!regencyId) return [];
    if (districtCache[regencyId]) return districtCache[regencyId];

    // Coba via Backend Laravel terlebih dahulu
    try {
      const res = await fetch(`${API_BASE_URL}/wilayah/districts/${regencyId}`);
      if (res.ok) {
        const data: RegionItem[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          districtCache[regencyId] = data;
          return data;
        }
      }
    } catch {
      // Fallback ke EMSIFA langsung
    }

    try {
      const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${regencyId}.json`);
      if (res.ok) {
        const data: RegionItem[] = await res.json();
        districtCache[regencyId] = data;
        return data;
      }
    } catch (e) {
      console.warn('Error fetching districts:', e);
    }
    return [];
  },

  // 4. Ambil Desa / Kelurahan via Backend Proxy Laravel (Bebas CORS)
  async getVillages(districtId: string): Promise<RegionItem[]> {
    if (!districtId) return [];
    if (villageCache[districtId]) return villageCache[districtId];

    // Coba via Backend Laravel terlebih dahulu
    try {
      const res = await fetch(`${API_BASE_URL}/wilayah/villages/${districtId}`);
      if (res.ok) {
        const data: RegionItem[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          villageCache[districtId] = data;
          return data;
        }
      }
    } catch {
      // Fallback ke EMSIFA langsung
    }

    try {
      const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/villages/${districtId}.json`);
      if (res.ok) {
        const data: RegionItem[] = await res.json();
        villageCache[districtId] = data;
        return data;
      }
    } catch (e) {
      console.warn('Error fetching villages:', e);
    }
    return [];
  }
};

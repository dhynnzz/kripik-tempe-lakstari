// Service wilayah Indonesia berkinerja tinggi
// 1. Provinsi, Kota/Kabupaten & Kecamatan: 100% Instan dari Dataset Lokal (/data/wilayah/...) (0ms latency, zero CORS)
// 2. Desa/Kelurahan: Dimuat dari endpoint backend proxy Laravel (/api/wilayah/...) dengan fallback online

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
      if (word === 'dki') return 'DKI';
      if (word === 'di') return 'DI';
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
  // 1. Ambil 100% Seluruh Provinsi di Indonesia (0 ms)
  async getProvinces(): Promise<RegionItem[]> {
    const data = await loadAllRegionsData();
    return data.provinces || [];
  },

  // 2. Ambil 100% Seluruh Kota / Kabupaten berdasarkan ID Provinsi (0 ms)
  async getRegencies(provinceId: string): Promise<RegionItem[]> {
    if (!provinceId) return [];
    const data = await loadAllRegionsData();
    if (data.regencies && data.regencies[provinceId]) {
      return data.regencies[provinceId];
    }

    try {
      const res = await fetch(`/data/wilayah/regencies/${provinceId}.json`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    try {
      const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return [];
  },

  // 3. Ambil 100% Seluruh Kecamatan di Indonesia (0 ms dari dataset lokal)
  async getDistricts(regencyId: string): Promise<RegionItem[]> {
    if (!regencyId) return [];
    if (districtCache[regencyId]) return districtCache[regencyId];

    // Coba langsung dari dataset lokal proyek (0 ms instant)
    try {
      const res = await fetch(`/data/wilayah/districts/${regencyId}.json`);
      if (res.ok) {
        const data: RegionItem[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          districtCache[regencyId] = data;
          return data;
        }
      }
    } catch (e) {}

    // Fallback via Backend Laravel Proxy
    try {
      const res = await fetch(`${API_BASE_URL}/wilayah/districts/${regencyId}`);
      if (res.ok) {
        const data: RegionItem[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          districtCache[regencyId] = data;
          return data;
        }
      }
    } catch (e) {}

    // Fallback EMSIFA Online
    try {
      const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${regencyId}.json`);
      if (res.ok) {
        const data: RegionItem[] = await res.json();
        districtCache[regencyId] = data;
        return data;
      }
    } catch (e) {}

    return [];
  },

  // 4. Ambil 100% Seluruh Desa / Kelurahan di Indonesia (0 ms dari dataset lokal)
  async getVillages(districtId: string): Promise<RegionItem[]> {
    if (!districtId) return [];
    if (villageCache[districtId]) return villageCache[districtId];

    // Coba langsung dari dataset lokal proyek (0 ms instant)
    try {
      const res = await fetch(`/data/wilayah/villages/${districtId}.json`);
      if (res.ok) {
        const data: RegionItem[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          villageCache[districtId] = data;
          return data;
        }
      }
    } catch (e) {}

    // Fallback via Backend Laravel Proxy (Bebas CORS)
    try {
      const res = await fetch(`${API_BASE_URL}/wilayah/villages/${districtId}`);
      if (res.ok) {
        const data: RegionItem[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          villageCache[districtId] = data;
          return data;
        }
      }
    } catch (e) {}

    // Fallback Online
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

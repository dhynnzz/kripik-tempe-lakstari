const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${url}, status: ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parser handling quotes
    const cols = [];
    let cur = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    cols.push(cur.trim());

    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] ? cols[idx].replace(/^"|"$/g, '').trim() : '';
    });
    results.push(obj);
  }
  return results;
}

async function main() {
  console.log('--- Mulai Membangun Dataset Wilayah Indonesia (38 Provinsi, 514 Kota, 7.285 Kecamatan, 83.762 Desa) ---');

  const baseDir = path.resolve(__dirname, '../public/data/wilayah');
  const districtsDir = path.join(baseDir, 'districts');
  const regenciesDir = path.join(baseDir, 'regencies');
  const villagesDir = path.join(baseDir, 'villages');

  [baseDir, districtsDir, regenciesDir, villagesDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // 1. Download Provinces
  console.log('1. Mengunduh data 38 Provinsi...');
  const provCsv = await fetchUrl('https://raw.githubusercontent.com/fityannugroho/idn-area-data/main/data/provinces.csv');
  const provList = parseCSV(provCsv).map(p => ({
    id: p.code,
    name: p.name.toUpperCase()
  }));
  console.log(`✓ Berhasil memproses ${provList.length} Provinsi.`);
  fs.writeFileSync(path.join(baseDir, 'provinces.json'), JSON.stringify(provList, null, 2));

  // 2. Download Regencies (Kota/Kabupaten)
  console.log('2. Mengunduh data 514 Kota / Kabupaten...');
  const regCsv = await fetchUrl('https://raw.githubusercontent.com/fityannugroho/idn-area-data/main/data/regencies.csv');
  const rawRegList = parseCSV(regCsv);
  
  const regenciesByProv = {};
  rawRegList.forEach(r => {
    const provId = r.province_code;
    if (!regenciesByProv[provId]) regenciesByProv[provId] = [];
    regenciesByProv[provId].push({
      id: r.code,
      province_id: provId,
      name: r.name.toUpperCase()
    });
  });

  // Simpan regencies per provinsi
  Object.keys(regenciesByProv).forEach(provId => {
    fs.writeFileSync(
      path.join(regenciesDir, `${provId}.json`),
      JSON.stringify(regenciesByProv[provId], null, 2)
    );
  });
  console.log(`✓ Berhasil memproses ${rawRegList.length} Kota/Kabupaten.`);

  // Simpan all_regions.json
  const allRegions = {
    provinces: provList,
    regencies: regenciesByProv
  };
  fs.writeFileSync(path.join(baseDir, 'all_regions.json'), JSON.stringify(allRegions));

  // 3. Download Districts (Kecamatan)
  console.log('3. Mengunduh data 7.285 Kecamatan...');
  const distCsv = await fetchUrl('https://raw.githubusercontent.com/fityannugroho/idn-area-data/main/data/districts.csv');
  const rawDistList = parseCSV(distCsv);

  const districtsByReg = {};
  rawDistList.forEach(d => {
    const regId = d.regency_code;
    if (!districtsByReg[regId]) districtsByReg[regId] = [];
    districtsByReg[regId].push({
      id: d.code,
      regency_id: regId,
      name: d.name.toUpperCase()
    });
  });

  Object.keys(districtsByReg).forEach(regId => {
    fs.writeFileSync(
      path.join(districtsDir, `${regId}.json`),
      JSON.stringify(districtsByReg[regId])
    );
  });
  console.log(`✓ Berhasil memproses ${rawDistList.length} Kecamatan ke dalam ${Object.keys(districtsByReg).length} file Kota/Kabupaten.`);

  // 4. Download Villages (Desa / Kelurahan)
  console.log('4. Mengunduh data 83.762 Desa / Kelurahan...');
  const villCsv = await fetchUrl('https://raw.githubusercontent.com/fityannugroho/idn-area-data/main/data/villages.csv');
  const rawVillList = parseCSV(villCsv);

  const villagesByDist = {};
  rawVillList.forEach(v => {
    const distId = v.district_code;
    if (!villagesByDist[distId]) villagesByDist[distId] = [];
    villagesByDist[distId].push({
      id: v.code,
      district_id: distId,
      name: v.name.toUpperCase()
    });
  });

  Object.keys(villagesByDist).forEach(distId => {
    fs.writeFileSync(
      path.join(villagesDir, `${distId}.json`),
      JSON.stringify(villagesByDist[distId])
    );
  });
  console.log(`✓ Berhasil memproses ${rawVillList.length} Desa/Kelurahan ke dalam ${Object.keys(villagesByDist).length} file Kecamatan.`);

  console.log('🎉 SEMUA DATA WILAYAH 38 PROVINSI, 514 KOTA, 7.285 KECAMATAN, 83.762 DESA BERHASIL DIBUAT!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

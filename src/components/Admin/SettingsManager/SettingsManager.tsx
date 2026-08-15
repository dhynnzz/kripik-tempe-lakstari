import { useState } from 'react';
import './SettingsManager.css';

const SettingsManager: React.FC = () => {
  const [storeInfo, setStoreInfo] = useState({
    name: 'Kripik Tempe Lakstari',
    phone: '08123456789',
    email: 'kontak@kripiktempelakstari.id',
    address: 'Jl. Raya Kripik Tempe No. 88, Malang, Jawa Timur',
    whatsapp: '628123456789',
    lowStockThreshold: '10'
  });

  const [savedMessage, setSavedMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="settings-manager-container">
      <div className="settings-card">
        <h3>Pengaturan Toko & Informasi Website</h3>
        <p>Kelola rincian kontak operasional, nomor WhatsApp pemesanan, dan batas notifikasi stok menipis (Sesuai Poin 13 PRD).</p>

        {savedMessage && (
          <div style={{ background: '#DCFCE7', color: '#166534', padding: '12px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', marginBottom: '16px' }}>
            ✓ Pengaturan toko berhasil diperbarui!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="settings-form-grid">
            <div className="settings-field">
              <label>Nama Toko / Usaha</label>
              <input 
                type="text" 
                value={storeInfo.name} 
                onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })} 
              />
            </div>

            <div className="settings-field">
              <label>Nomor WhatsApp Toko (Pengiriman Nota)</label>
              <input 
                type="text" 
                value={storeInfo.whatsapp} 
                onChange={(e) => setStoreInfo({ ...storeInfo, whatsapp: e.target.value })} 
              />
            </div>

            <div className="settings-field">
              <label>Email Layanan Pelanggan</label>
              <input 
                type="email" 
                value={storeInfo.email} 
                onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })} 
              />
            </div>

            <div className="settings-field">
              <label>Batas Peringatan Stok Menipis (Pcs)</label>
              <input 
                type="number" 
                value={storeInfo.lowStockThreshold} 
                onChange={(e) => setStoreInfo({ ...storeInfo, lowStockThreshold: e.target.value })} 
              />
            </div>

            <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
              <label>Alamat Lengkap Toko / Gudang Pengiriman</label>
              <textarea 
                value={storeInfo.address} 
                onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })} 
              />
            </div>
          </div>

          <button type="submit" className="btn-save-settings">
            Simpan Pengaturan Toko
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsManager;

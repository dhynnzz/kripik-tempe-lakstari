import React, { useState } from 'react';
import './SettingsManager.css';

interface StoreSettings {
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

const defaultSettings: StoreSettings = {
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

type SettingsTab = 'general' | 'contact' | 'inventory' | 'shipping' | 'payment';

const SettingsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<StoreSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lakstari_store_settings');
      if (saved) {
        try {
          return { ...defaultSettings, ...JSON.parse(saved) };
        } catch {
          return defaultSettings;
        }
      }
    }
    return defaultSettings;
  });

  const [savedMessage, setSavedMessage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lakstari_store_settings', JSON.stringify(settings));
      }
      setIsSaving(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    }, 400);
  };

  const handleCourierToggle = (key: keyof StoreSettings['couriers']) => {
    setSettings((prev) => ({
      ...prev,
      couriers: {
        ...prev.couriers,
        [key]: !prev.couriers[key],
      },
    }));
  };

  const handlePaymentMethodToggle = (key: keyof StoreSettings['paymentMethods']) => {
    setSettings((prev) => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [key]: !prev.paymentMethods[key],
      },
    }));
  };

  return (
    <div className="settings-manager-container">
      {/* Header Banner */}
      <div className="settings-header-bar">
        <div>
          <h2>Pengaturan Toko & Informasi Website</h2>
          <p>Kelola profil usaha, kontak WhatsApp, ekspedisi kurir, pembayaran, dan peringatan stok.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="settings-tabs-nav">
        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Profil Toko</span>
        </button>

        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>Kontak & Sosmed</span>
        </button>

        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
          <span>Stok & Inventori</span>
        </button>

        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
          onClick={() => setActiveTab('shipping')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <span>Pengiriman & Kurir</span>
        </button>

        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          <span>Pembayaran & Midtrans</span>
        </button>
      </div>

      {/* Main Settings Form Card */}
      <div className="settings-card">
        {savedMessage && (
          <div className="settings-toast-success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Pengaturan toko berhasil diperbarui dan disimpan!</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ════════ TAB 1: PROFIL TOKO ════════ */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h3>Identitas & Profil Usaha</h3>
                <p>Informasi dasar toko yang akan ditampilkan kepada pembeli di website.</p>
              </div>

              <div className="settings-form-grid">
                <div className="settings-field">
                  <label>Nama Toko / Usaha <span className="req">*</span></label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    required
                  />
                </div>

                <div className="settings-field">
                  <label>Slogan / Tagline Usaha</label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    placeholder="Contoh: Renyah, Gurih & Asli Tradisional"
                  />
                </div>

                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Deskripsi Singkat Toko (Footer & Tentang Kami)</label>
                  <textarea
                    value={settings.description}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    placeholder="Tuliskan profil singkat tentang toko Anda..."
                  />
                </div>

                <div className="settings-field">
                  <label>Kota / Wilayah Asal Pengiriman</label>
                  <input
                    type="text"
                    value={settings.cityOrigin}
                    onChange={(e) => setSettings({ ...settings, cityOrigin: e.target.value })}
                  />
                  <small className="field-hint">Digunakan sebagai titik dasar penghitungan tarif ongkir ekspedisi.</small>
                </div>

                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Alamat Lengkap Toko / Gudang Pengiriman</label>
                  <textarea
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    placeholder="Alamat lengkap beserta kode pos..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* ════════ TAB 2: KONTAK & SOSMED ════════ */}
          {activeTab === 'contact' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h3>Kontak Operasional & Media Sosial</h3>
                <p>Saluran komunikasi utama untuk konfirmasi pesanan dan melayani pertanyaan pelanggan.</p>
              </div>

              <div className="settings-form-grid">
                <div className="settings-field">
                  <label>Nomor WhatsApp Resmi (Notifikasi & Nota) <span className="req">*</span></label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">📞</span>
                    <input
                      type="text"
                      value={settings.whatsapp}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      placeholder="628123456789"
                      required
                    />
                  </div>
                  <small className="field-hint">Gunakan format internasional tanpa tanda + (contoh: 628123456789).</small>
                </div>

                <div className="settings-field">
                  <label>Email Layanan Pelanggan (CS) <span className="req">*</span></label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">✉️</span>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Jam & Hari Operasional Toko</label>
                  <input
                    type="text"
                    value={settings.operatingHours}
                    onChange={(e) => setSettings({ ...settings, operatingHours: e.target.value })}
                    placeholder="Senin - Sabtu: 08.00 - 17.00 WIB"
                  />
                </div>

                <div className="settings-field">
                  <label>Username Instagram</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">📸 @</span>
                    <input
                      type="text"
                      value={settings.instagram}
                      onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                      placeholder="kripiktempe.lakstari"
                    />
                  </div>
                </div>

                <div className="settings-field">
                  <label>Username TikTok</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">🎵 @</span>
                    <input
                      type="text"
                      value={settings.tiktok}
                      onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })}
                      placeholder="lakstari_official"
                    />
                  </div>
                </div>

                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Nama Halaman Facebook</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">📘</span>
                    <input
                      type="text"
                      value={settings.facebook}
                      onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                      placeholder="Kripik Tempe Lakstari"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════ TAB 3: STOK & INVENTORI ════════ */}
          {activeTab === 'inventory' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h3>Peringatan Stok & Kebijakan Habis</h3>
                <p>Atur batas peringatan otomatis ketika stok produk mulai menipis di gudang.</p>
              </div>

              <div className="settings-form-grid">
                <div className="settings-field">
                  <label>Batas Peringatan Stok Menipis (Pcs)</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.lowStockThreshold}
                    onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })}
                  />
                  <small className="field-hint">Produk dengan stok di bawah angka ini akan ditandai dengan peringatan kuning di Dashboard.</small>
                </div>

                <div className="settings-field">
                  <label>Tindakan Saat Produk Habis (Stok 0)</label>
                  <select
                    value={settings.outOfStockAction}
                    onChange={(e) => setSettings({ ...settings, outOfStockAction: e.target.value as any })}
                  >
                    <option value="badge">Tetap Tampilkan dengan Label "Stok Habis"</option>
                    <option value="hide">Sembunyikan Otomatis dari Katalog Pelanggan</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ════════ TAB 4: PENGIRIMAN & KURIR ════════ */}
          {activeTab === 'shipping' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h3>Layanan Kurir & Aturan Pengiriman</h3>
                <p>Kelola ekspedisi kurir yang aktif serta program promo bebas ongkos kirim.</p>
              </div>

              <div className="settings-field-group">
                <label className="group-label">Ekspedisi Kurir yang Disediakan</label>
                <div className="courier-grid">
                  <label className={`courier-card ${settings.couriers.jne ? 'is-selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={settings.couriers.jne}
                      onChange={() => handleCourierToggle('jne')}
                    />
                    <div className="courier-info">
                      <span className="courier-name">📦 JNE Express</span>
                      <span className="courier-desc">Layanan Reguler & YES</span>
                    </div>
                  </label>

                  <label className={`courier-card ${settings.couriers.jnt ? 'is-selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={settings.couriers.jnt}
                      onChange={() => handleCourierToggle('jnt')}
                    />
                    <div className="courier-info">
                      <span className="courier-name">🚚 J&T Express</span>
                      <span className="courier-desc">Layanan EZ & Super</span>
                    </div>
                  </label>

                  <label className={`courier-card ${settings.couriers.sicepat ? 'is-selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={settings.couriers.sicepat}
                      onChange={() => handleCourierToggle('sicepat')}
                    />
                    <div className="courier-info">
                      <span className="courier-name">⚡ SiCepat Ekspres</span>
                      <span className="courier-desc">Layanan SIUNTUNG & BEST</span>
                    </div>
                  </label>

                  <label className={`courier-card ${settings.couriers.pos ? 'is-selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={settings.couriers.pos}
                      onChange={() => handleCourierToggle('pos')}
                    />
                    <div className="courier-info">
                      <span className="courier-name">📮 Pos Indonesia</span>
                      <span className="courier-desc">Layanan Pos Kilat Khusus</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="settings-form-grid" style={{ marginTop: '20px' }}>
                <div className="settings-field">
                  <label>Estimasi Waktu Pengemasan</label>
                  <div className="input-with-prefix">
                    <input
                      type="number"
                      min="1"
                      value={settings.packingDays}
                      onChange={(e) => setSettings({ ...settings, packingDays: parseInt(e.target.value) || 1 })}
                    />
                    <span className="input-suffix">Hari Kerja</span>
                  </div>
                </div>

                <div className="settings-field">
                  <label>Minimal Belanja Gratis Ongkir (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={settings.freeShippingMinAmount}
                    onChange={(e) => setSettings({ ...settings, freeShippingMinAmount: parseInt(e.target.value) || 0 })}
                  />
                  <small className="field-hint">Pesanan di atas nominal ini akan otomatis mendapat potongan ongkir.</small>
                </div>
              </div>
            </div>
          )}

          {/* ════════ TAB 5: PEMBAYARAN & MIDTRANS ════════ */}
          {activeTab === 'payment' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h3>Metode Pembayaran & Gateway Midtrans</h3>
                <p>Konfigurasi saluran pembayaran otomatis (QRIS & Virtual Account Bank).</p>
              </div>

              <div className="settings-field-group">
                <label className="group-label">Metode Pembayaran yang Diaktifkan</label>
                <div className="courier-grid">
                  <label className={`courier-card ${settings.paymentMethods.qris ? 'is-selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={settings.paymentMethods.qris}
                      onChange={() => handlePaymentMethodToggle('qris')}
                    />
                    <div className="courier-info">
                      <span className="courier-name">📱 QRIS (Semua E-Wallet)</span>
                      <span className="courier-desc">GoPay, OVO, Dana, ShopeePay</span>
                    </div>
                  </label>

                  <label className={`courier-card ${settings.paymentMethods.bca ? 'is-selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={settings.paymentMethods.bca}
                      onChange={() => handlePaymentMethodToggle('bca')}
                    />
                    <div className="courier-info">
                      <span className="courier-name">🏦 BCA Virtual Account</span>
                      <span className="courier-desc">Verifikasi Otomatis</span>
                    </div>
                  </label>

                  <label className={`courier-card ${settings.paymentMethods.bni ? 'is-selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={settings.paymentMethods.bni}
                      onChange={() => handlePaymentMethodToggle('bni')}
                    />
                    <div className="courier-info">
                      <span className="courier-name">🏦 BNI Virtual Account</span>
                      <span className="courier-desc">Verifikasi Otomatis</span>
                    </div>
                  </label>

                  <label className={`courier-card ${settings.paymentMethods.bri ? 'is-selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={settings.paymentMethods.bri}
                      onChange={() => handlePaymentMethodToggle('bri')}
                    />
                    <div className="courier-info">
                      <span className="courier-name">🏦 BRI Virtual Account (BRIVA)</span>
                      <span className="courier-desc">Verifikasi Otomatis</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="settings-form-grid" style={{ marginTop: '20px' }}>
                <div className="settings-field">
                  <label>Batas Waktu Pembayaran (Jam)</label>
                  <div className="input-with-prefix">
                    <input
                      type="number"
                      min="1"
                      max="72"
                      value={settings.paymentExpiryHours}
                      onChange={(e) => setSettings({ ...settings, paymentExpiryHours: parseInt(e.target.value) || 24 })}
                    />
                    <span className="input-suffix">Jam</span>
                  </div>
                  <small className="field-hint">Pesanan akan otomatis dibatalkan jika belum dibayar setelah durasi ini.</small>
                </div>

                <div className="settings-field">
                  <label>Lingkungan Midtrans Gateway</label>
                  <select
                    value={settings.midtransEnvironment}
                    onChange={(e) => setSettings({ ...settings, midtransEnvironment: e.target.value as any })}
                  >
                    <option value="sandbox">Sandbox (Mode Percobaan / Testing)</option>
                    <option value="production">Production (Mode Transaksi Asli)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Footer Submit Button */}
          <div className="settings-actions">
            <button type="submit" className="btn-save-settings" disabled={isSaving}>
              {isSaving ? (
                <>
                  <span className="spinner-mini"></span>
                  <span>Menyimpan Pengaturan...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span>Simpan Perubahan Pengaturan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsManager;

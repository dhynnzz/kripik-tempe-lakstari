import React, { useEffect, useState } from 'react';
import { useCart } from '../../../context/CartContext';
import './CartDrawer.css';
import { apiService } from '../../../services/api';
import { regionService, formatRegionName, type RegionItem } from '../../../services/regionService';

export interface ShippingOption {
  id: string;
  name: string;
  courier: string;
  cost: number;
  etd: string;
  badge?: string;
}

export const shippingOptions: ShippingOption[] = [
  {
    id: 'reguler',
    name: 'Reguler (2–3 hari)',
    courier: 'JNE / J&T / Sicepat',
    cost: 20000,
    etd: '2–3 hari',
    badge: 'Populer'
  },
  {
    id: 'kargo',
    name: 'Kargo / Hemat (3–5 hari)',
    courier: 'JTR / J&T Cargo',
    cost: 15000,
    etd: '3–5 hari',
    badge: 'Hemat'
  },
  {
    id: 'instan',
    name: 'Instan (Hari ini)',
    courier: 'Gojek / Grab (Max 15km)',
    cost: 35000,
    etd: '1–3 jam',
    badge: 'Cepat'
  },
  {
    id: 'pickup',
    name: 'Ambil di Toko (Self Pick-up)',
    courier: 'Toko Kripik Tempe Lakstari',
    cost: 0,
    etd: 'Bisa Diambil Langsung',
    badge: 'Gratis'
  }
];

const CartDrawer: React.FC = () => {
  const { isCartOpen, toggleCart, cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [selectedShippingId, setSelectedShippingId] = useState<string>('reguler');

  // State data wilayah
  const [provinces, setProvinces] = useState<RegionItem[]>([]);
  const [cities, setCities] = useState<RegionItem[]>([]);
  const [districts, setDistricts] = useState<RegionItem[]>([]);
  const [villages, setVillages] = useState<RegionItem[]>([]);

  // State ID terpilih untuk cascading request API
  const [selectedProvId, setSelectedProvId] = useState('');
  const [selectedRegencyId, setSelectedRegencyId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');

  // Loading states
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);
  
  const [formData, setFormData] = useState({
    nama_pelanggan: '',
    no_hp: '',
    email: '',
    alamat_lengkap: '',
    desa_kelurahan: '',
    kecamatan: '',
    kota: '',
    provinsi: '',
    kode_pos: '',
    catatan: '',
  });

  // Ambil data seluruh provinsi saat awal load
  useEffect(() => {
    regionService.getProvinces().then((data) => {
      setProvinces(data);
    });
  }, []);

  if (!isCartOpen) return null;

  // 1. Handler saat memilih Provinsi
  const handleProvinceChange = async (provId: string) => {
    const selected = provinces.find((p) => p.id === provId);
    setSelectedProvId(provId);
    setSelectedRegencyId('');
    setSelectedDistrictId('');
    setSelectedVillageId('');

    setCities([]);
    setDistricts([]);
    setVillages([]);

    setFormData(prev => ({
      ...prev,
      provinsi: selected ? formatRegionName(selected.name) : '',
      kota: '',
      kecamatan: '',
      desa_kelurahan: ''
    }));

    if (provId) {
      setIsLoadingCities(true);
      const regencies = await regionService.getRegencies(provId);
      setCities(regencies);
      setIsLoadingCities(false);
    }
  };

  // 2. Handler saat memilih Kota/Kabupaten
  const handleCityChange = async (cityId: string) => {
    const selected = cities.find((c) => c.id === cityId);
    setSelectedRegencyId(cityId);
    setSelectedDistrictId('');
    setSelectedVillageId('');

    setDistricts([]);
    setVillages([]);

    setFormData(prev => ({
      ...prev,
      kota: selected ? formatRegionName(selected.name) : '',
      kecamatan: '',
      desa_kelurahan: ''
    }));

    if (cityId) {
      setIsLoadingDistricts(true);
      const dists = await regionService.getDistricts(cityId);
      setDistricts(dists);
      setIsLoadingDistricts(false);
    }
  };

  // 3. Handler saat memilih Kecamatan
  const handleDistrictChange = async (districtId: string) => {
    const selected = districts.find((d) => d.id === districtId);
    setSelectedDistrictId(districtId);
    setSelectedVillageId('');

    setVillages([]);

    setFormData(prev => ({
      ...prev,
      kecamatan: selected ? formatRegionName(selected.name) : '',
      desa_kelurahan: ''
    }));

    if (districtId) {
      setIsLoadingVillages(true);
      const vills = await regionService.getVillages(districtId);
      setVillages(vills);
      setIsLoadingVillages(false);
    }
  };

  // 4. Handler saat memilih Desa/Kelurahan
  const handleVillageChange = (villageId: string) => {
    const selected = villages.find((v) => v.id === villageId);
    setSelectedVillageId(villageId);
    setFormData(prev => ({
      ...prev,
      desa_kelurahan: selected ? formatRegionName(selected.name) : ''
    }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      alert('Silakan setujui Syarat & Ketentuan serta Kebijakan Privasi terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    
    const items = cartItems.map(item => {
      const parsedId = item.productId || parseInt(item.id.replace(/\D/g, '')) || 1;
      return { id_product: parsedId, qty: item.quantity };
    });

    const fullAlamat = `${formData.alamat_lengkap}${formData.desa_kelurahan ? ', Kel/Desa ' + formData.desa_kelurahan : ''}${formData.catatan ? ' (Catatan: ' + formData.catatan + ')' : ''}`;

    const payload = {
      nama_pelanggan: formData.nama_pelanggan,
      no_hp: formData.no_hp,
      email: formData.email ? formData.email.trim() : null,
      alamat_lengkap: fullAlamat,
      kecamatan: formData.kecamatan,
      kota: formData.kota,
      provinsi: formData.provinsi,
      kode_pos: formData.kode_pos,
      items: items,
      biaya_pengiriman: selectedShipping.cost
    };

    const res = await apiService.checkout(payload);
    setIsSubmitting(false);

    if (res && res.invoice) {
      alert('Pesanan Berhasil Dibuat! Invoice: ' + res.invoice);
      setCheckoutStep(0);
      toggleCart(false);
      window.location.reload();
    } else {
      alert('Gagal melakukan checkout: ' + (res?.message || 'Error'));
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
  };

  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectedShipping = shippingOptions.find(s => s.id === selectedShippingId) || shippingOptions[0];
  const ongkir = selectedShipping.cost;
  const totalBayar = totalPrice + ongkir;

  return (
    <>
      {/* ==========================================================
          1. STEP 0: SIDEBAR DRAWER KERANJANG BELANJA (GAMBAR 1)
          ========================================================== */}
      {checkoutStep === 0 && (
        <>
          <div 
            className={`cart-sidebar-overlay ${isCartOpen ? 'open' : ''}`}
            onClick={() => toggleCart(false)}
          />

          <div className={`cart-sidebar-drawer ${isCartOpen ? 'open' : ''}`}>
            
            {/* Header Sidebar */}
            <div className="cart-sidebar-header">
              <div className="cart-sidebar-title-row">
                <h3>Keranjang Belanja</h3>
                <button className="cart-sidebar-close" onClick={() => toggleCart(false)} title="Tutup">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="cart-sidebar-breadcrumb">
                <span>Beranda</span>
                <span className="separator">&gt;</span>
                <span className="active">Keranjang ({totalItemCount} item)</span>
              </div>
            </div>

            {/* Content List Sidebar */}
            <div className="cart-sidebar-body">
              {cartItems.length === 0 ? (
                <div className="cart-sidebar-empty">
                  <div className="cart-empty-icon-wrap">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8" cy="21" r="2"></circle>
                      <circle cx="18" cy="21" r="2"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                  </div>
                  <h4>Keranjang Belanja Kosong</h4>
                  <p>Belum ada produk kripik tempe yang Anda pilih.</p>
                </div>
              ) : (
                <div className="cart-sidebar-items-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-sidebar-item-card">
                      
                      <div className="cart-sidebar-item-top">
                        {item.image && (
                          <div className="cart-sidebar-img-box">
                            <img src={item.image} alt={item.productName} />
                          </div>
                        )}
                        <div className="cart-sidebar-item-info">
                          <h4 className="cart-sidebar-item-title">{item.variant || item.productName}</h4>
                          <span className="cart-sidebar-item-weight">{item.weight || '150 gram'}</span>
                          <span className="cart-sidebar-item-price">{formatRupiah(item.priceRaw)}</span>
                        </div>
                      </div>

                      <div className="cart-sidebar-item-bottom">
                        {/* Kontrol Qty Pill */}
                        <div className="cart-qty-pill">
                          <button 
                            className="qty-circle-btn" 
                            onClick={() => updateQuantity(item.id, -1)}
                            title="Kurangi"
                          >
                            -
                          </button>
                          <span className="qty-number">{item.quantity}</span>
                          <button 
                            className="qty-circle-btn" 
                            onClick={() => updateQuantity(item.id, 1)} 
                            disabled={item.stock !== undefined && item.quantity >= item.stock} 
                            title={item.stock !== undefined && item.quantity >= item.stock ? 'Maksimal stok tercapai' : 'Tambah'}
                          >
                            +
                          </button>
                        </div>

                        <span className="cart-sidebar-item-subtotal">{formatRupiah(item.priceRaw * item.quantity)}</span>

                        <button 
                          className="cart-trash-btn-small" 
                          onClick={() => removeFromCart(item.id)} 
                          title="Hapus Item"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary Sidebar */}
            {cartItems.length > 0 && (
              <div className="cart-sidebar-footer">
                <div className="cart-sidebar-summary-box">
                  <div className="summary-row-mini">
                    <span>Total Harga ({totalItemCount} Barang)</span>
                    <span className="val">{formatRupiah(totalPrice)}</span>
                  </div>
                  <div className="summary-row-mini">
                    <span>Ongkos Kirim</span>
                    <span className="val-hint">Dihitung saat checkout</span>
                  </div>
                  <hr className="summary-divider-mini" />
                  <div className="summary-row-total">
                    <span className="label">Total Belanja</span>
                    <span className="price">{formatRupiah(totalPrice)}</span>
                  </div>
                </div>

                <button 
                  className="btn-sidebar-checkout"
                  onClick={() => setCheckoutStep(1)}
                >
                  Lanjut ke Pembayaran
                </button>
              </div>
            )}

          </div>
        </>
      )}

      {/* ==========================================================
          2. STEP 1: MODAL POP-UP TENGAH CHECKOUT (GAMBAR 2)
          ========================================================== */}
      {isCartOpen && checkoutStep === 1 && (
        <div className="checkout-page-overlay open" onClick={() => setCheckoutStep(0)}>
          <div className="checkout-page-card" onClick={(e) => e.stopPropagation()}>
            
            {/* Header & Breadcrumb Checkout */}
            <div className="checkout-page-top">
              <div>
                <div className="cart-breadcrumb" style={{ marginBottom: '6px' }}>
                  <span>Beranda</span>
                  <span className="breadcrumb-separator">&gt;</span>
                  <span style={{ cursor: 'pointer', color: '#D97706', fontWeight: 600 }} onClick={() => setCheckoutStep(0)}>Keranjang</span>
                  <span className="breadcrumb-separator">&gt;</span>
                  <span className="breadcrumb-active">Form Checkout</span>
                </div>
                <h1 className="checkout-main-title">Form Checkout & Pembayaran</h1>
              </div>

              <button className="checkout-close-circle" onClick={() => setCheckoutStep(0)} title="Kembali ke Keranjang">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="checkout-page-body">
              <div className="checkout-main-grid">
                
                {/* SISI KIRI: Data Pengiriman & Pilihan Pengiriman */}
                <div className="checkout-left-section">
                  
                  {/* CARD 1: Data Pengiriman */}
                  <div className="checkout-card-box">
                    <div className="card-box-header">
                      <span className="box-icon-wrap truck-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="3" width="15" height="13"></rect>
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                          <circle cx="5.5" cy="18.5" r="2.5"></circle>
                          <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                      </span>
                      <h3>Data Pengiriman</h3>
                    </div>

                    <div className="box-form-body">
                      
                      {/* Nama Lengkap */}
                      <div className="form-item">
                        <label>Nama Lengkap</label>
                        <input 
                          required 
                          type="text"
                          placeholder="Masukkan nama lengkap penerima" 
                          value={formData.nama_pelanggan} 
                          onChange={e => setFormData({...formData, nama_pelanggan: e.target.value})} 
                        />
                      </div>

                      {/* No WhatsApp & Email */}
                      <div className="form-item-2col">
                        <div className="form-item">
                          <label>Nomor WhatsApp</label>
                          <input 
                            required 
                            type="tel"
                            placeholder="Contoh: 081234567890" 
                            value={formData.no_hp} 
                            onChange={e => setFormData({...formData, no_hp: e.target.value})} 
                          />
                        </div>
                        <div className="form-item">
                          <label>Email (Opsional)</label>
                          <input 
                            type="email" 
                            placeholder="nama@email.com" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                          />
                        </div>
                      </div>

                      {/* Provinsi, Kota/Kabupaten & Kode Pos (3 Kolom Sejajar) */}
                      <div className="form-item-3col">
                        <div className="form-item">
                          <label>Provinsi</label>
                          <div className="custom-select-box">
                            <select 
                              required 
                              value={selectedProvId} 
                              onChange={e => handleProvinceChange(e.target.value)}
                              className="styled-select"
                            >
                              <option value="" disabled>Pilih Provinsi</option>
                              {provinces.map(prov => (
                                <option key={prov.id} value={prov.id}>
                                  {formatRegionName(prov.name)}
                                </option>
                              ))}
                            </select>
                            <span className="select-chevron">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            </span>
                          </div>
                        </div>

                        <div className="form-item">
                          <label>Kota/Kabupaten</label>
                          <div className="custom-select-box">
                            <select 
                              required 
                              value={selectedRegencyId} 
                              onChange={e => handleCityChange(e.target.value)}
                              className="styled-select"
                              disabled={!selectedProvId || isLoadingCities}
                            >
                              <option value="" disabled>
                                {!selectedProvId 
                                  ? 'Pilih Provinsi' 
                                  : (isLoadingCities ? 'Memuat kota...' : 'Pilih Kota')}
                              </option>
                              {cities.map(city => (
                                <option key={city.id} value={city.id}>
                                  {formatRegionName(city.name)}
                                </option>
                              ))}
                            </select>
                            <span className="select-chevron">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            </span>
                          </div>
                        </div>

                        <div className="form-item">
                          <label>Kode Pos</label>
                          <input 
                            required 
                            type="text"
                            placeholder="Misal: 40111" 
                            value={formData.kode_pos} 
                            onChange={e => setFormData(prev => ({ ...prev, kode_pos: e.target.value.replace(/\D/g, '').slice(0, 5) }))} 
                          />
                        </div>
                      </div>

                      {/* Kecamatan & Desa / Kelurahan (2 Kolom Dropdown Berantai) */}
                      <div className="form-item-2col">
                        <div className="form-item">
                          <label>Kecamatan</label>
                          <div className="custom-select-box">
                            <select 
                              required 
                              value={selectedDistrictId} 
                              onChange={e => handleDistrictChange(e.target.value)}
                              className="styled-select"
                              disabled={!selectedRegencyId || isLoadingDistricts}
                            >
                              <option value="" disabled>
                                {!selectedRegencyId 
                                  ? 'Pilih Kota dulu' 
                                  : (isLoadingDistricts ? 'Memuat kecamatan...' : 'Pilih Kecamatan')}
                              </option>
                              {districts.map(dist => (
                                <option key={dist.id} value={dist.id}>
                                  {formatRegionName(dist.name)}
                                </option>
                              ))}
                            </select>
                            <span className="select-chevron">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            </span>
                          </div>
                        </div>

                        <div className="form-item">
                          <label>Desa / Kelurahan</label>
                          <div className="custom-select-box">
                            <select 
                              required 
                              value={selectedVillageId} 
                              onChange={e => handleVillageChange(e.target.value)}
                              className="styled-select"
                              disabled={!selectedDistrictId || isLoadingVillages}
                            >
                              <option value="" disabled>
                                {!selectedDistrictId 
                                  ? 'Pilih Kecamatan dulu' 
                                  : (isLoadingVillages ? 'Memuat kelurahan...' : 'Pilih Desa / Kelurahan')}
                              </option>
                              {villages.map(vill => (
                                <option key={vill.id} value={vill.id}>
                                  {formatRegionName(vill.name)}
                                </option>
                              ))}
                            </select>
                            <span className="select-chevron">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Alamat Lengkap (Ditaruh di bawah Kecamatan & Desa / Kelurahan) */}
                      <div className="form-item">
                        <label>Alamat Lengkap</label>
                        <textarea 
                          required 
                          rows={2}
                          placeholder="Nama jalan, RT/RW, nomor rumah, patokan lokasi" 
                          value={formData.alamat_lengkap} 
                          onChange={e => setFormData({...formData, alamat_lengkap: e.target.value})} 
                        />
                      </div>

                      {/* Catatan Tambahan */}
                      <div className="form-item">
                        <label>Catatan Tambahan (Opsional)</label>
                        <input 
                          type="text"
                          placeholder="Contoh: Titip di pos satpam atau jangan dibanting" 
                          value={formData.catatan} 
                          onChange={e => setFormData({...formData, catatan: e.target.value})} 
                        />
                      </div>

                    </div>
                  </div>

                  {/* CARD 2: Pilihan Pengiriman (Ekspedisi & Kurir) */}
                  <div className="checkout-card-box">
                    <div className="card-box-header">
                      <span className="box-icon-wrap box-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                          <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                      </span>
                      <h3>Pilihan Pengiriman</h3>
                    </div>

                    <div className="shipping-options-list">
                      {shippingOptions.map((opt) => {
                        const isSelected = selectedShippingId === opt.id;
                        return (
                          <div 
                            key={opt.id}
                            className={`shipping-option-box ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedShippingId(opt.id)}
                          >
                            <div className="shipping-left">
                              <div className={`custom-radio-dot ${isSelected ? 'active' : ''}`}>
                                {isSelected && <div className="inner-dot"></div>}
                              </div>
                              <div className="shipping-text">
                                <div className="shipping-name-row">
                                  <span className="shipping-name">{opt.name}</span>
                                  {opt.badge && (
                                    <span className={`shipping-badge ${opt.cost === 0 ? 'badge-free' : ''}`}>
                                      {opt.badge}
                                    </span>
                                  )}
                                </div>
                                <span className="shipping-courier">{opt.courier}</span>
                              </div>
                            </div>
                            <span className={`shipping-price ${opt.cost === 0 ? 'price-free' : ''}`}>
                              {opt.cost === 0 ? 'Gratis' : formatRupiah(opt.cost)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* SISI KANAN: Ringkasan Pesanan */}
                <div className="checkout-right-section">
                  <div className="checkout-summary-card-box">
                    <h3 className="summary-title">Ringkasan Pesanan</h3>

                    {/* Mini Item List */}
                    <div className="order-items-scroll">
                      {cartItems.map((item) => (
                        <div key={item.id} className="order-item-row">
                          <div className="order-item-left">
                            {item.image ? (
                              <img src={item.image} alt={item.variant} className="order-item-thumb" />
                            ) : (
                              <div className="order-item-thumb-placeholder"></div>
                            )}
                            <div className="order-item-meta">
                              <span className="order-product-name">{item.variant || item.productName}</span>
                              <span className="order-product-qty">{item.weight || '150gr'} x {item.quantity}</span>
                            </div>
                          </div>
                          <span className="order-item-price">{formatRupiah(item.priceRaw * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <hr className="order-divider" />

                    {/* Breakdown Biaya */}
                    <div className="order-calc-row">
                      <span>Total Harga ({totalItemCount} Barang)</span>
                      <span>{formatRupiah(totalPrice)}</span>
                    </div>
                    <div className="order-calc-row">
                      <span>Ongkos Kirim</span>
                      <span>{formatRupiah(ongkir)}</span>
                    </div>

                    <hr className="order-divider" />

                    {/* Total Bayar Highlight */}
                    <div className="order-total-highlight">
                      <span className="total-title">Total Bayar</span>
                      <span className="total-value-amber">{formatRupiah(totalBayar)}</span>
                    </div>

                    {/* Checkbox Persetujuan */}
                    <label className="terms-checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={agreedTerms} 
                        onChange={(e) => setAgreedTerms(e.target.checked)} 
                      />
                      <span>
                        Saya setuju dengan <a href="#" onClick={(e) => e.preventDefault()}>Syarat & Ketentuan</a> serta <a href="#" onClick={(e) => e.preventDefault()}>Kebijakan Privasi</a> Lakstari.
                      </span>
                    </label>

                    {/* Tombol Selesaikan Pesanan */}
                    <button 
                      type="submit" 
                      disabled={isSubmitting || !agreedTerms} 
                      className="btn-selesaikan-pesanan"
                    >
                      {isSubmitting ? 'Memproses Pesanan...' : 'Selesaikan Pesanan & Bayar'}
                    </button>

                    {/* Security Badge */}
                    <div className="order-security-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <span>Transaksi Aman & Terenkripsi</span>
                    </div>

                  </div>
                </div>

              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
};

export default CartDrawer;

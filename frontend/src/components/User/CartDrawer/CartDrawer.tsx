import React, { useEffect, useState } from 'react';
import { useCart } from '../../../context/CartContext';
import './CartDrawer.css';
import { apiService } from '../../../services/api';
import { regionService, formatRegionName, type RegionItem } from '../../../services/regionService';
import CustomSelect from '../CustomSelect/CustomSelect';

declare global {
  interface Window {
    snap: any;
  }
}

interface CartDrawerProps {
  onNavigateToTracking?: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateToTracking }) => {
  const { isCartOpen, toggleCart, cartItems, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const [checkoutStep, setCheckoutStep] = useState(0); // 0 = Cart, 1 = Form, 2 = Success/Payment Instructions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Data pesanan setelah berhasil checkout
  const [successData, setSuccessData] = useState<{invoice: string, payment_type: string, payment_code: string} | null>(null);

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

  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bca_va' | 'bni_va' | 'bri_va'>('qris');

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
      email: formData.email ? formData.email.trim() : undefined,
      alamat_lengkap: fullAlamat,
      kecamatan: formData.kecamatan,
      kota: formData.kota,
      provinsi: formData.provinsi,
      kode_pos: formData.kode_pos,
      items: items,
      biaya_pengiriman: 20000
    };

    try {
      const res = await apiService.checkout({
        ...payload,
        payment_method: paymentMethod
      });
      
      setIsSubmitting(false);

      if (res && res.success && res.snap_token) {
        window.snap.pay(res.snap_token, {
          onSuccess: function(_result: any) {
            // Simpan ke local storage
            localStorage.setItem('last_invoice', res.invoice);
            setSuccessData({
              invoice: res.invoice,
              payment_type: res.payment_type || paymentMethod,
              payment_code: ''
            });
            clearCart();
            setCheckoutStep(2);
          },
          onPending: function(_result: any) {
            localStorage.setItem('last_invoice', res.invoice);
            setSuccessData({
              invoice: res.invoice,
              payment_type: res.payment_type || paymentMethod,
              payment_code: ''
            });
            clearCart();
            setCheckoutStep(2);
          },
          onError: function(_result: any) {
            alert('Pembayaran gagal atau terjadi kesalahan.');
          },
          onClose: function() {
            // User closes popup without finishing
          }
        });
      } else {
        alert("Gagal memproses pesanan: " + (res?.message || "Kesalahan server"));
      }
    } catch (err: any) {
      setIsSubmitting(false);
      console.error(err);
      alert("Terjadi kesalahan sistem di frontend: " + err.toString());
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
  };

  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const ongkir = 20000;
  const totalBayar = totalPrice + ongkir;

  return (
    <>
      {/* 1. SIDEBAR KERANJANG BELANJA (Step 0) */}
      <div 
        className={`cart-overlay ${(isCartOpen && checkoutStep === 0) ? 'open' : ''}`} 
        onClick={() => toggleCart(false)}
      ></div>
      
      <div className={`cart-drawer ${(isCartOpen && checkoutStep === 0) ? 'open' : ''}`}>
        
        <div className="cart-header-wrapper">
          <div className="cart-header">
            <h2>Keranjang Belanja</h2>
            <button className="close-btn" onClick={() => toggleCart(false)} title="Tutup Keranjang">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>Keranjang belanja Anda masih kosong.</p>
            </div>
          ) : (
            <div className="cart-items-container">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  
                  <div className="cart-item-info-row">
                    {item.image && (
                      <div className="cart-item-image">
                        <img src={item.image} alt={item.productName} />
                      </div>
                    )}

                    <div className="cart-item-details">
                      <h4>{item.productName}</h4>
                      <p className="cart-item-variant">{item.variant} {item.weight ? `• ${item.weight}` : ''}</p>
                      <span className="cart-item-unit-price">{formatRupiah(item.priceRaw)}</span>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>

                    <div className="cart-item-price-total">
                      {formatRupiah(item.priceRaw * item.quantity)}
                    </div>

                    <button className="trash-btn" onClick={() => removeFromCart(item.id)} title="Hapus Item">
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



          {cartItems.length > 0 && (
            <div className="cart-summary-card">
              <h3>Ringkasan Belanja</h3>
              
              <div className="summary-row">
                <span className="summary-label">Total ({totalItemCount} Barang)</span>
                <span className="summary-value">{formatRupiah(totalPrice)}</span>
              </div>
              
              <div className="summary-row">
                <span className="summary-label">Ongkos Kirim</span>
                <span className="summary-value small-text">Dihitung saat checkout</span>
              </div>
              
              <hr className="summary-divider" />
              
              <div className="summary-row total-row">
                <span className="summary-label-bold">Total Belanja</span>
                <span className="summary-total-price">{formatRupiah(totalPrice)}</span>
              </div>
              
              <button className="btn-lanjut-pembayaran" onClick={() => setCheckoutStep(1)}>
                Lanjut ke Pengiriman
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 2. MODAL FORM CHECKOUT (Step 1 - Desain Pembayaran Sesuai Mockup) */}
      {isCartOpen && checkoutStep === 1 && (
        <div className="checkout-page-overlay" onClick={() => setCheckoutStep(0)}>
          <div className="checkout-page-card" onClick={(e) => e.stopPropagation()}>
            
            {/* Header Judul Pembayaran */}
            <div className="checkout-page-top">
              <h1 className="checkout-main-title">Pembayaran</h1>
              <button className="checkout-close-circle" onClick={() => setCheckoutStep(0)} title="Kembali">
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
                          placeholder="Masukkan nama lengkap" 
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

                      {/* Alamat Lengkap */}
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

                      {/* Provinsi, Kota/Kabupaten & Kode Pos (3 Kolom Sejajar) */}
                      <div className="form-item-3col">
                        <div className="form-item">
                          <label>Provinsi</label>
                          <CustomSelect
                            options={provinces.map(prov => ({
                              value: prov.id,
                              label: formatRegionName(prov.name)
                            }))}
                            value={selectedProvId}
                            onChange={val => handleProvinceChange(val)}
                            placeholder="Pilih Provinsi"
                          />
                        </div>

                        <div className="form-item">
                          <label>Kota/Kabupaten</label>
                          <CustomSelect
                            options={cities.map(city => ({
                              value: city.id,
                              label: formatRegionName(city.name)
                            }))}
                            value={selectedRegencyId}
                            onChange={val => handleCityChange(val)}
                            placeholder={!selectedProvId ? 'Pilih Provinsi' : (isLoadingCities ? 'Memuat kota...' : 'Pilih Kota')}
                            disabled={!selectedProvId || isLoadingCities}
                          />
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
                          <CustomSelect
                            options={districts.map(dist => ({
                              value: dist.id,
                              label: formatRegionName(dist.name)
                            }))}
                            value={selectedDistrictId}
                            onChange={val => handleDistrictChange(val)}
                            placeholder={!selectedRegencyId ? 'Pilih Kota dulu' : (isLoadingDistricts ? 'Memuat kecamatan...' : 'Pilih Kecamatan')}
                            disabled={!selectedRegencyId || isLoadingDistricts}
                          />
                        </div>

                        <div className="form-item">
                          <label>Desa / Kelurahan</label>
                          <CustomSelect
                            options={villages.map(vill => ({
                              value: vill.id,
                              label: formatRegionName(vill.name)
                            }))}
                            value={selectedVillageId}
                            onChange={val => handleVillageChange(val)}
                            placeholder={!selectedDistrictId ? 'Pilih Kecamatan dulu' : (isLoadingVillages ? 'Memuat kelurahan...' : 'Pilih Desa / Kelurahan')}
                            disabled={!selectedDistrictId || isLoadingVillages}
                          />
                        </div>
                      </div>

                      {/* Catatan Tambahan */}
                      <div className="form-item">
                        <label>Catatan Tambahan (Opsional)</label>
                        <input 
                          type="text"
                          placeholder="Contoh: Titip di pos satpam" 
                          value={formData.catatan} 
                          onChange={e => setFormData({...formData, catatan: e.target.value})} 
                        />
                      </div>

                    </div>
                  </div>

                  {/* CARD 2: Metode Pembayaran (Hanya QRIS, BCA, BNI, BRI) */}
                  <div className="checkout-card-box payment-method-card">
                    <div className="card-box-header">
                      <span className="box-icon-wrap" style={{ background: '#FEF3C7' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                          <circle cx="12" cy="12" r="2"></circle>
                          <path d="M6 12h.01M18 12h.01"></path>
                        </svg>
                      </span>
                      <h3>Metode Pembayaran</h3>
                    </div>

                    <div className="payment-card-content">
                      
                      {/* Grid 4 Pilihan Pembayaran: QRIS, BCA, BNI, BRI */}
                      <div className="ewallet-grid">
                        
                        {/* 1. QRIS */}
                        <div 
                          className={`ewallet-btn-card ${paymentMethod === 'qris' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('qris')}
                        >
                          <div className="ewallet-logo-box">
                            <img src="/logo-qris.png" alt="QRIS" className="payment-logo-img" />
                          </div>
                          <span className="payment-sub-text">E-Wallet & QR</span>
                        </div>

                        {/* 2. BCA Virtual Account */}
                        <div 
                          className={`ewallet-btn-card ${paymentMethod === 'bca_va' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('bca_va')}
                        >
                          <div className="ewallet-logo-box">
                            <img src="/logo-bca.png" alt="BCA" className="payment-logo-img" />
                          </div>
                          <span className="payment-sub-text">Virtual Account</span>
                        </div>

                        {/* 3. BNI Virtual Account */}
                        <div 
                          className={`ewallet-btn-card ${paymentMethod === 'bni_va' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('bni_va')}
                        >
                          <div className="ewallet-logo-box">
                            <img src="/logo-bni.png" alt="BNI" className="payment-logo-img" />
                          </div>
                          <span className="payment-sub-text">Virtual Account</span>
                        </div>

                        {/* 4. BRI Virtual Account */}
                        <div 
                          className={`ewallet-btn-card ${paymentMethod === 'bri_va' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('bri_va')}
                        >
                          <div className="ewallet-logo-box">
                            <img src="/logo-bri.png" alt="BRI" className="payment-logo-img" />
                          </div>
                          <span className="payment-sub-text">Virtual Account</span>
                        </div>

                      </div>

                      {/* Penjelasan Metode Terpilih */}
                      <div className="payment-selected-hint">
                        {paymentMethod === 'qris' && (
                          <span>⚡ <strong>QRIS:</strong> Scan QR bayar instan via GoPay, OVO, DANA, ShopeePay, BCA mobile, dan seluruh m-Banking.</span>
                        )}
                        {paymentMethod === 'bca_va' && (
                          <span>🏦 <strong>BCA Virtual Account:</strong> Pembayaran otomatis via m-BCA, KlikBCA, atau ATM BCA.</span>
                        )}
                        {paymentMethod === 'bni_va' && (
                          <span>🏦 <strong>BNI Virtual Account:</strong> Pembayaran otomatis via BNI Mobile Banking, Internet Banking, atau ATM BNI.</span>
                        )}
                        {paymentMethod === 'bri_va' && (
                          <span>🏦 <strong>BRI Virtual Account:</strong> Pembayaran otomatis via BRImo, Internet Banking, atau ATM BRI.</span>
                        )}
                      </div>

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
                      {isSubmitting ? 'Memproses Pesanan...' : 'Selesaikan Pesanan'}
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

      {/* 3. MODAL SUKSES & INSTRUKSI PEMBAYARAN (Step 2) */}
      {isCartOpen && checkoutStep === 2 && successData && (
        <div className="checkout-page-overlay">
          <div className="checkout-page-card" style={{ maxWidth: '600px', textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ width: '60px', height: '60px', background: '#4CAF50', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
            
            <h2 style={{ color: '#1E293B', marginBottom: '10px' }}>Pesanan Berhasil Dibuat!</h2>
            <p style={{ color: '#64748B', marginBottom: '30px' }}>Nomor Invoice: <strong>{successData.invoice}</strong></p>

            <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '30px', textAlign: 'left' }}>
              <p style={{ color: '#334155', lineHeight: '1.6' }}>
                Terima kasih! Pesanan Anda telah berhasil tercatat di sistem kami.
                Silakan simpan nomor invoice di atas untuk mengecek status pesanan Anda.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {onNavigateToTracking && (
                <button 
                  className="btn-selesaikan-pesanan"
                  style={{ background: '#10B981', flex: 1 }}
                  onClick={() => {
                    setCheckoutStep(0);
                    toggleCart(false);
                    onNavigateToTracking();
                  }}
                >
                  Lacak Pesanan
                </button>
              )}
              <button 
                className="btn-selesaikan-pesanan"
                style={{ flex: 1 }}
                onClick={() => {
                  setCheckoutStep(0);
                  toggleCart(false);
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default CartDrawer;

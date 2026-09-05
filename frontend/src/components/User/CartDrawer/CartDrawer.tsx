import React, { useEffect, useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { normalizeProductImage } from '../../../context/ProductContext';
import Swal from 'sweetalert2';
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
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Data pesanan setelah berhasil checkout
  const [successData, setSuccessData] = useState<{ invoice: string, payment_type: string, payment_code: string, status?: 'success' | 'pending' } | null>(null);

  // State data wilayah lokal
  const [provinces, setProvinces] = useState<RegionItem[]>([]);
  const [cities, setCities] = useState<RegionItem[]>([]);
  const [districts, setDistricts] = useState<RegionItem[]>([]);
  const [villages, setVillages] = useState<RegionItem[]>([]);

  // State ID terpilih untuk cascading request API lokal
  const [selectedProvId, setSelectedProvId] = useState('');
  const [selectedRegencyId, setSelectedRegencyId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');

  // Loading states
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);

  // Biteship Postal Code State
  const [biteshipPostalCodes, setBiteshipPostalCodes] = useState<any[]>([]);
  const [isLoadingPostalCodes, setIsLoadingPostalCodes] = useState(false);
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

  // State ongkos kirim (Biteship)
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [selectedCourierId, setSelectedCourierId] = useState('');
  const [ongkir, setOngkir] = useState(0);

  // Ambil data seluruh provinsi saat awal load
  useEffect(() => {
    regionService.getProvinces().then((data) => {
      setProvinces(data);
    });
  }, []);

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
    setBiteshipPostalCodes([]);

    setFormData(prev => ({
      ...prev,
      provinsi: selected ? formatRegionName(selected.name) : '',
      kota: '',
      kecamatan: '',
      desa_kelurahan: '',
      kode_pos: ''
    }));
    setShippingOptions([]);
    setOngkir(0);
    setSelectedCourierId('');

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
    setBiteshipPostalCodes([]);

    setFormData(prev => ({
      ...prev,
      kota: selected ? formatRegionName(selected.name) : '',
      kecamatan: '',
      desa_kelurahan: '',
      kode_pos: ''
    }));
    setShippingOptions([]);
    setOngkir(0);
    setSelectedCourierId('');

    if (cityId) {
      setIsLoadingDistricts(true);
      const dists = await regionService.getDistricts(cityId);
      setDistricts(dists);
      setIsLoadingDistricts(false);
    }
  };

  // 3. Handler saat memilih Kecamatan (Sekaligus menarik Kode Pos dari Biteship)
  const handleDistrictChange = async (districtId: string) => {
    const selected = districts.find((d) => d.id === districtId);
    setSelectedDistrictId(districtId);
    setSelectedVillageId('');

    setVillages([]);
    setBiteshipPostalCodes([]);
    
    const districtName = selected ? formatRegionName(selected.name) : '';
    setFormData(prev => ({
      ...prev,
      kecamatan: districtName,
      desa_kelurahan: '',
      kode_pos: ''
    }));
    setShippingOptions([]);
    setOngkir(0);
    setSelectedCourierId('');

    if (districtId && selected) {
      setIsLoadingVillages(true);
      const vills = await regionService.getVillages(districtId);
      setVillages(vills);
      setIsLoadingVillages(false);

      // Tarik Kode Pos dari Biteship
      setIsLoadingPostalCodes(true);
      try {
        const searchQuery = `${districtName} ${formData.kota}`;
        const res = await apiService.searchBiteshipAreas(searchQuery);
        if (res && res.success && res.areas) {
          // Filter out duplicates postal codes (sometimes Biteship returns same postal code multiple times)
          const uniquePostalCodes = Array.from(new Set(res.areas.map((a: any) => a.postal_code)))
            .map(code => {
              return res.areas.find((a: any) => a.postal_code === code);
            });
          
          setBiteshipPostalCodes(uniquePostalCodes);
          
          // Auto-fill jika hanya 1 kode pos
          if (uniquePostalCodes.length === 1) {
            setFormData(prev => ({ ...prev, kode_pos: uniquePostalCodes[0].postal_code.toString() }));
          }
        }
      } catch (err) {
        console.error("Gagal menarik kode pos dari biteship", err);
      } finally {
        setIsLoadingPostalCodes(false);
      }
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

  // Kunci scroll dan interaksi halaman belakang saat keranjang atau form pembayaran terbuka
  useEffect(() => {
    if (isCartOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        document.body.style.paddingRight = '';
      };
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;



  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      Swal.fire({ title: 'Perhatian', text: 'Silakan setujui Syarat & Ketentuan serta Kebijakan Privasi terlebih dahulu.', icon: 'warning' });
      return;
    }

    setIsSubmitting(true);

    if (ongkir === 0) {
      Swal.fire({ title: 'Perhatian', text: 'Silakan cek dan pilih metode pengiriman terlebih dahulu.', icon: 'warning' });
      setIsSubmitting(false);
      return;
    }

    const selectedOption = shippingOptions.find((opt: any) => `${opt.courier_name}-${opt.courier_service_name}` === selectedCourierId);

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
      biaya_pengiriman: ongkir,
      kurir: selectedOption ? (selectedOption.company || selectedOption.courier_name).toUpperCase() : '',
      layanan_kurir: selectedOption ? (selectedOption.type || selectedOption.courier_service_name) : ''
    };

    try {
      const res = await apiService.checkout({
        ...payload,
        payment_method: paymentMethod
      });

      setIsSubmitting(false);

      if (res && res.success && res.snap_token) {
        if (res.snap_token.startsWith('DEMO_SNAP_') || !window.snap) {
          // Mode Testing / Demo Checkout
          localStorage.setItem('last_invoice', res.invoice);
          setSuccessData({
            invoice: res.invoice,
            payment_type: res.payment_type || paymentMethod,
            payment_code: 'PAY-' + Math.floor(100000 + Math.random() * 900000),
            status: 'pending'
          });
          clearCart();
          setCheckoutStep(2);
          Swal.fire({
            title: 'Pesanan Berhasil Dibuat!',
            text: `Nomor Invoice: ${res.invoice}. Pesanan Anda telah tersimpan dan masuk ke sistem toko!`,
            icon: 'success'
          });
        } else {
          window.snap.pay(res.snap_token, {
            onSuccess: async function (_result: any) {
              // Beritahu backend (fallback localhost karena webhook tak terjangkau)
              await apiService.paymentSuccessFallback(res.invoice);

              // Simpan ke local storage
              localStorage.setItem('last_invoice', res.invoice);
              setSuccessData({
                invoice: res.invoice,
                payment_type: res.payment_type || paymentMethod,
                payment_code: '',
                status: 'success'
              });
              clearCart();
              setCheckoutStep(2);
            },
            onPending: function (_result: any) {
              localStorage.setItem('last_invoice', res.invoice);
              setSuccessData({
                invoice: res.invoice,
                payment_type: res.payment_type || paymentMethod,
                payment_code: '',
                status: 'pending'
              });
              clearCart();
              setCheckoutStep(2);
            },
            onError: function (_result: any) {
              Swal.fire({ title: 'Gagal', text: 'Pembayaran gagal atau terjadi kesalahan.', icon: 'error' });
            },
            onClose: function () {
              // User closes popup without finishing
            }
          });
        }
      } else {
        Swal.fire({ title: 'Gagal', text: "Gagal memproses pesanan: " + (res?.message || "Kesalahan server"), icon: 'error' });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      console.error(err);
      Swal.fire({ title: 'Error Sistem', text: "Terjadi kesalahan sistem di frontend: " + err.toString(), icon: 'error' });
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
  };

  const fetchShippingRates = async () => {
    if (!formData.kode_pos || formData.kode_pos.length < 5) {
      Swal.fire({ title: 'Perhatian', text: 'Masukkan kode pos yang valid (5 digit) untuk mengecek ongkir.', icon: 'warning' });
      return;
    }
    setIsLoadingRates(true);
    setShippingOptions([]);
    setSelectedCourierId('');
    setOngkir(0);

    const items = cartItems.map(item => ({
      name: item.productName,
      price: item.priceRaw,
      weight: parseInt(item.weight || '150'),
      quantity: item.quantity
    }));

    try {
      const res = await apiService.getShippingRates({
        destination_postal_code: formData.kode_pos,
        items
      });
      if (res && res.success && res.data && res.data.pricing) {
        setShippingOptions(res.data.pricing);
      } else {
        const errMsg = res?.error?.error || res?.message || 'Pastikan kode pos benar atau area didukung.';
        Swal.fire({ title: 'Gagal', text: `Gagal mengambil daftar ongkir: ${errMsg}`, icon: 'error' });
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({ title: 'Error', text: `Terjadi kesalahan saat memuat ongkir: ${err.message || ''}`, icon: 'error' });
    } finally {
      setIsLoadingRates(false);
    }
  };

  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
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
                        <img
                          src={normalizeProductImage(item.image)}
                          alt={item.productName}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/products/flavor-original.png';
                          }}
                        />
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
                Lanjutkan Pesanan
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
                      <span className="box-icon-wrap">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </span>
                      <div className="card-header-titles">
                        <h3>Data Pengiriman</h3>
                        <span className="card-header-sub">Informasi penerima dan alamat tujuan paket</span>
                      </div>
                    </div>
                    <div className="box-form-body">

                      {/* Baris 1: Nama Lengkap & Nomor WhatsApp */}
                      <div className="form-item-2col">
                        <div className="form-item">
                          <label>
                            <span className="form-label-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                            </span>
                            Nama Lengkap
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="Masukkan nama lengkap penerima"
                            value={formData.nama_pelanggan}
                            onChange={e => setFormData({ ...formData, nama_pelanggan: e.target.value })}
                          />
                        </div>

                        <div className="form-item">
                          <label>
                            <span className="form-label-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                              </svg>
                            </span>
                            Nomor WhatsApp
                          </label>
                          <input
                            required
                            type="tel"
                            placeholder="Contoh: 081234567890"
                            value={formData.no_hp}
                            onChange={e => setFormData({ ...formData, no_hp: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Baris 2: Email (Opsional) & Catatan Tambahan (Opsional) */}
                      <div className="form-item-2col">
                        <div className="form-item">
                          <label>
                            <span className="form-label-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                              </svg>
                            </span>
                            Email (Opsional)
                          </label>
                          <input
                            type="email"
                            placeholder="nama@email.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>

                        <div className="form-item">
                          <label>
                            <span className="form-label-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                              </svg>
                            </span>
                            Catatan Tambahan (Opsional)
                          </label>
                          <input
                            type="text"
                            placeholder="Titip di pos satpam / pagar"
                            value={formData.catatan}
                            onChange={e => setFormData({ ...formData, catatan: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Baris 3: Alamat Lengkap */}
                      <div className="form-item">
                        <label>
                          <span className="form-label-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                          </span>
                          Alamat Lengkap
                        </label>
                        <textarea
                          required
                          rows={2}
                          placeholder="Nama jalan, RT/RW, nomor rumah, atau patokan lokasi"
                          value={formData.alamat_lengkap}
                          onChange={e => setFormData({ ...formData, alamat_lengkap: e.target.value })}
                        />
                      </div>

                      {/* Baris 4: Provinsi, Kota/Kabupaten & Kode Pos (3 Kolom Sejajar) */}
                      <div className="form-item-3col">
                        <div className="form-item">
                          <label>
                            <span className="form-label-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                                <line x1="8" y1="2" x2="8" y2="18"></line>
                                <line x1="16" y1="6" x2="16" y2="22"></line>
                              </svg>
                            </span>
                            Provinsi
                          </label>
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
                          <label>
                            <span className="form-label-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 21h18"></path>
                                <path d="M5 21V7l8-4v18"></path>
                                <path d="M19 21V11l-6-4"></path>
                              </svg>
                            </span>
                            Kota/Kabupaten
                          </label>
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
                          <label>
                            <span className="form-label-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                              </svg>
                            </span>
                            Kecamatan
                          </label>
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
                      </div>

                      {/* Baris 5: Desa / Kelurahan & Kode Pos (2 Kolom Dropdown Berantai) */}
                      <div className="form-item-2col">
                        <div className="form-item">
                          <label>
                            <span className="form-label-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"></path>
                                <path d="M9 22V12h6v10"></path>
                                <path d="M2 10.6L12 2l10 8.6"></path>
                              </svg>
                            </span>
                            Desa / Kelurahan
                          </label>
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

                        <div className="form-item">
                          <label>
                            <span className="form-label-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="4" y1="9" x2="20" y2="9"></line>
                                <line x1="4" y1="15" x2="20" y2="15"></line>
                                <line x1="10" y1="3" x2="8" y2="21"></line>
                                <line x1="16" y1="3" x2="14" y2="21"></line>
                              </svg>
                            </span>
                            Kode Pos
                          </label>
                          <CustomSelect
                            options={biteshipPostalCodes.map(area => ({
                              value: area.postal_code.toString(),
                              label: `${area.postal_code} - ${area.name}`
                            }))}
                            value={formData.kode_pos}
                            onChange={val => setFormData(prev => ({ ...prev, kode_pos: val }))}
                            placeholder={!selectedDistrictId ? 'Pilih Kecamatan' : (isLoadingPostalCodes ? 'Mencari...' : (biteshipPostalCodes.length === 0 ? 'Tidak ditemukan' : 'Pilih Kode Pos'))}
                            disabled={!selectedDistrictId || isLoadingPostalCodes || biteshipPostalCodes.length === 0}
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* SUB-GRID BAWAH: Pilihan Pengiriman & Metode Pembayaran Berdampingan */}
                  <div className="checkout-bottom-grid">

                    {/* CARD 1.5: Pilihan Pengiriman (Biteship) */}
                    <div className="checkout-card-box shipping-method-card">                      <div className="card-box-header">
                      <span className="box-icon-wrap">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="3" width="15" height="13" rx="1"></rect>
                          <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
                          <circle cx="5.5" cy="18.5" r="2.5"></circle>
                          <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                      </span>
                      <div className="card-header-titles">
                        <h3>Pilihan Pengiriman</h3>
                        <span className="card-header-sub">Pilih opsi kurir resmi dan estimasi tiba</span>
                      </div>
                    </div>

                      <div className="box-form-body">
                        {shippingOptions.length === 0 ? (
                          <div className="shipping-empty-box">
                            <div className="shipping-empty-icon">
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="3" width="15" height="13" rx="1"></rect>
                                <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
                                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                <circle cx="18.5" cy="18.5" r="2.5"></circle>
                              </svg>
                            </div>
                            <p>
                              {formData.kode_pos.length === 5
                                ? <>Kode pos <strong>{formData.kode_pos}</strong> siap. Klik tombol di bawah untuk menampilkan kurir.</>
                                : <>Masukkan <strong>Kode Pos</strong> di atas, lalu klik tombol untuk mengecek tarif kurir.</>
                              }
                            </p>
                            <button
                              type="button"
                              onClick={fetchShippingRates}
                              disabled={isLoadingRates || formData.kode_pos.length < 5}
                              className="btn-cek-ongkir-prominent"
                            >
                              {isLoadingRates ? (
                                <>
                                  <span className="btn-spinner-white"></span>
                                  <span>Menghitung Ongkir...</span>
                                </>
                              ) : (
                                <>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                  </svg>
                                  <span>Cek Pilihan Ongkir</span>
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="shipping-list-wrapper">
                            <div className="shipping-list-topbar">
                              <span className="shipping-count-badge">{shippingOptions.length} Layanan Kurir</span>
                              <button
                                type="button"
                                onClick={fetchShippingRates}
                                disabled={isLoadingRates}
                                className="btn-refresh-rates"
                                title="Hitung ulang tarif kurir"
                              >
                                {isLoadingRates ? (
                                  <>
                                    <span className="btn-spinner-tiny"></span>
                                    <span>Memuat...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                                    </svg>
                                    <span>Cek Ulang</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="shipping-options-list">
                              {shippingOptions.map((opt: any) => {
                                const optId = `${opt.courier_name}-${opt.courier_service_name}`;
                                const isSelected = selectedCourierId === optId;
                                return (
                                  <label key={optId} className={`shipping-opt-card ${isSelected ? 'selected' : ''}`}>
                                    <input
                                      type="radio"
                                      name="shipping_service"
                                      value={optId}
                                      checked={isSelected}
                                      onChange={() => {
                                        setSelectedCourierId(optId);
                                        setOngkir(opt.price);
                                      }}
                                      className="shipping-opt-radio"
                                    />
                                    <div className="shipping-opt-info">
                                      <div className="shipping-opt-header">
                                        <span className="shipping-courier-tag">{opt.courier_name}</span>
                                        <span className="shipping-courier-name">{opt.courier_service_name}</span>
                                      </div>
                                      <div className="shipping-opt-meta">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <circle cx="12" cy="12" r="10"></circle>
                                          <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                        <span>Estimasi {opt.duration} {opt.shipment_duration_unit ? opt.shipment_duration_unit.toLowerCase() : ''}</span>
                                      </div>
                                    </div>
                                    <div className="shipping-opt-price">
                                      {formatRupiah(opt.price)}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CARD 2: Metode Pembayaran (Hanya QRIS, BCA, BNI, BRI) */}
                    <div className="checkout-card-box payment-method-card">
                      <div className="card-box-header">
                        <span className="box-icon-wrap">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                            <line x1="2" y1="10" x2="22" y2="10"></line>
                          </svg>
                        </span>
                        <div className="card-header-titles">
                          <h3>Metode Pembayaran</h3>
                          <span className="card-header-sub">QRIS otomatis & Virtual Account Bank resmi</span>
                        </div>
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
                              <img src="/images/payments/logo-qris.png" alt="QRIS" className="payment-logo-img" />
                            </div>
                            <span className="payment-sub-text">E-Wallet & QR</span>
                          </div>

                          {/* 2. BCA Virtual Account */}
                          <div
                            className={`ewallet-btn-card ${paymentMethod === 'bca_va' ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod('bca_va')}
                          >
                            <div className="ewallet-logo-box">
                              <img src="/images/payments/logo-bca.png" alt="BCA" className="payment-logo-img" />
                            </div>
                            <span className="payment-sub-text">Virtual Account</span>
                          </div>

                          {/* 3. BNI Virtual Account */}
                          <div
                            className={`ewallet-btn-card ${paymentMethod === 'bni_va' ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod('bni_va')}
                          >
                            <div className="ewallet-logo-box">
                              <img src="/images/payments/logo-bni.png" alt="BNI" className="payment-logo-img" />
                            </div>
                            <span className="payment-sub-text">Virtual Account</span>
                          </div>

                          {/* 4. BRI Virtual Account */}
                          <div
                            className={`ewallet-btn-card ${paymentMethod === 'bri_va' ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod('bri_va')}
                          >
                            <div className="ewallet-logo-box">
                              <img src="/images/payments/logo-bri.png" alt="BRI" className="payment-logo-img" />
                            </div>
                            <span className="payment-sub-text">Virtual Account</span>
                          </div>

                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* SISI KANAN: Ringkasan Pesanan */}
                <div className="checkout-right-section">

                  <div className="checkout-summary-card-box">
                    <h3 className="summary-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="box-icon-wrap" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                      </span>
                      Ringkasan Pesanan
                    </h3>

                    {/* Mini Item List */}
                    <div className="order-items-scroll">
                      {cartItems.map((item) => (
                        <div key={item.id} className="order-item-row">
                          <div className="order-item-left">
                            {item.image ? (
                              <img
                                src={normalizeProductImage(item.image)}
                                alt={item.variant}
                                className="order-item-thumb"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = '/images/products/flavor-original.png';
                                }}
                              />
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

            <h2 style={{ color: '#1E293B', marginBottom: '10px' }}>
              {successData.status === 'success' ? 'Pembayaran Berhasil' : 'Menunggu Pembayaran'}
            </h2>
            <p style={{ color: '#64748B', marginBottom: '30px' }}>Nomor Invoice: <strong>{successData.invoice}</strong></p>

            <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '30px', textAlign: 'left' }}>
              <p style={{ color: '#334155', lineHeight: '1.6' }}>
                {successData.status === 'success'
                  ? 'Pembayaran Anda telah berhasil kami terima. Pesanan Anda akan segera diproses dan dikirimkan oleh pihak toko.'
                  : 'Pesanan Anda telah tercatat. Silakan segera selesaikan pembayaran sesuai instruksi (contoh: transfer VA atau scan QRIS) agar pesanan dapat segera kami proses dan kirimkan.'}
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

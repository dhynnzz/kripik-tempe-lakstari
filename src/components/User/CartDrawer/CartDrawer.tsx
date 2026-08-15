import React from 'react';
import { useCart } from '../../../context/CartContext';
import './CartDrawer.css';

import { apiService } from '../../../services/api';

const CartDrawer: React.FC = () => {
  const { isCartOpen, toggleCart, cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();
  const [checkoutStep, setCheckoutStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    nama_pelanggan: '',
    no_hp: '',
    email: '',
    alamat_lengkap: '',
    kecamatan: '',
    kota: '',
    provinsi: '',
    kode_pos: '',
  });

  if (!isCartOpen) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const items = cartItems.map(item => {
      // Kita perlu ID produk asli dari database. Karena sebelumnya di cart kita gabung productName + variant.
      // Sebagai workaround simpel, kita anggap id produk tersimpan di id yang diparsing, atau kita pasang hardcode untuk demo. 
      // Karena `id` di cartItem aslinya string (e.g. "Keripik Tempe Varian Rasa-Original").
      // Idealnya CartItem menyimpan id_product saat addToCart. Di sini saya parse id sementara jika bentuknya angka, jika tidak saya fallback ke 1.
      const parsedId = parseInt(item.id.replace(/\D/g,'')) || 1; 
      
      // Update: Di ProductList kita sudah mapping options ke p.id. Tapi saat AddToCart kita belum pass `id_product`.
      // Tentu, lebih baik jika addToCart menerima id_product. Tapi untuk sekarang, asumsikan kita punya id di cart.
      return { id_product: parsedId, qty: item.quantity };
    });

    const payload = {
      ...formData,
      items: items,
      biaya_pengiriman: 15000 // flat rate ongkir untuk demo
    };

    const res = await apiService.checkout(payload);
    setIsSubmitting(false);

    if (res && res.success) {
      alert("Pesanan Berhasil Dibuat! Invoice: " + res.invoice);
      setCheckoutStep(0);
      toggleCart(false);
      // idealnya panggil clearCart() disini
      window.location.reload(); // refresh to clear cart and fetch new stock
    } else {
      alert("Gagal melakukan checkout: " + (res?.message || 'Error'));
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
  };

  return (
    <>
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => toggleCart(false)}></div>
      
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        
        <div className="cart-header-wrapper">
          <div className="cart-header">
            <h2>{checkoutStep === 0 ? 'Keranjang Belanja' : 'Form Checkout'}</h2>
            <button className="close-btn" onClick={() => {
                if (checkoutStep === 1) setCheckoutStep(0);
                else toggleCart(false);
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {checkoutStep === 1 ? (
                   <polyline points="15 18 9 12 15 6"></polyline>
                ) : (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <div className="cart-content">
          {checkoutStep === 0 ? (
            <>
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
                          <p className="cart-item-variant">{item.variant}</p>
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

                        <button className="trash-btn" onClick={() => removeFromCart(item.id)}>
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
                    <span className="summary-label">Total Harga ({cartItems.length} Barang)</span>
                    <span className="summary-value">{formatRupiah(totalPrice)}</span>
                  </div>
                  
                  <div className="summary-row">
                    <span className="summary-label">Ongkos Kirim</span>
                    <span className="summary-value small-text">Dihitung saat<br/>checkout</span>
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
            </>
          ) : (
            <div className="checkout-form-container" style={{ padding: '20px' }}>
               <h3 style={{ marginBottom: '20px', color: 'var(--primary-dark)' }}>Data Pengiriman</h3>
               <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input required placeholder="Nama Lengkap" value={formData.nama_pelanggan} onChange={e => setFormData({...formData, nama_pelanggan: e.target.value})} style={inputStyle} />
                  <input required placeholder="Nomor WhatsApp (Cth: 0812...)" value={formData.no_hp} onChange={e => setFormData({...formData, no_hp: e.target.value})} style={inputStyle} />
                  <input type="email" placeholder="Email (Opsional)" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
                  <textarea required placeholder="Alamat Lengkap (Jalan, RT/RW, No Rumah)" value={formData.alamat_lengkap} onChange={e => setFormData({...formData, alamat_lengkap: e.target.value})} style={{...inputStyle, height: '80px'}} />
                  <input required placeholder="Kecamatan" value={formData.kecamatan} onChange={e => setFormData({...formData, kecamatan: e.target.value})} style={inputStyle} />
                  <input required placeholder="Kota / Kabupaten" value={formData.kota} onChange={e => setFormData({...formData, kota: e.target.value})} style={inputStyle} />
                  <input required placeholder="Provinsi" value={formData.provinsi} onChange={e => setFormData({...formData, provinsi: e.target.value})} style={inputStyle} />
                  <input required placeholder="Kode Pos" value={formData.kode_pos} onChange={e => setFormData({...formData, kode_pos: e.target.value})} style={inputStyle} />
                  
                  <div className="cart-summary-card" style={{ marginTop: '20px' }}>
                    <div className="summary-row total-row">
                      <span className="summary-label-bold">Total + Ongkir (Rp 15.000)</span>
                      <span className="summary-total-price">{formatRupiah(totalPrice + 15000)}</span>
                    </div>
                    
                    <button type="submit" disabled={isSubmitting} className="btn-lanjut-pembayaran" style={{ background: isSubmitting ? '#ccc' : 'var(--primary-green)' }}>
                      {isSubmitting ? 'Memproses...' : 'Buat Pesanan & Bayar'}
                    </button>
                  </div>
               </form>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

const inputStyle = {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #EAEFEF',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none'
};

export default CartDrawer;

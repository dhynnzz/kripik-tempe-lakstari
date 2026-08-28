import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import './OrderTracking.css';

interface OrderTrackingProps {
  onBack: () => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ onBack }) => {
  const [invoice, setInvoice] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    // Cek localStorage jika ada pesanan terakhir
    const lastInvoice = localStorage.getItem('last_invoice');
    if (lastInvoice) {
      setInvoice(lastInvoice);
    }
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice || !phone) {
      setError('Harap isi Nomor Invoice dan Nomor WA untuk melanjutkan.');
      return;
    }

    setLoading(true);
    setError('');
    
    const res = await apiService.trackOrder(invoice.trim(), phone.trim());
    if (res.success) {
      setOrderData(res.data);
    } else {
      setError(res.message || 'Pesanan tidak ditemukan. Mohon cek kembali datanya.');
      setOrderData(null);
    }
    setLoading(false);
  };

  const handleContinuePayment = () => {
    if (orderData && orderData.snap_token) {
      (window as any).snap.pay(orderData.snap_token, {
        onSuccess: function(_result: any) {
          alert('Pembayaran berhasil!');
          handleTrack({ preventDefault: () => {} } as any); // Refresh status
        },
        onPending: function(_result: any) {
          // Boleh direfresh atau dibiarkan
        },
        onError: function(_result: any) {
          alert('Terjadi kesalahan saat memproses pembayaran.');
        }
      });
    } else {
      alert('Gagal memuat popup pembayaran. Token tidak ditemukan.');
    }
  };

  return (
    <div className="order-tracking-container">
      <div className="ot-header">
        <button onClick={onBack} className="ot-back-btn" style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          &larr; Kembali
        </button>
        <h2>Lacak Pesanan Anda</h2>
        <p>Ketahui status terkini pesanan Anda atau lanjutkan pembayaran.</p>
      </div>

      <div className="ot-card">
        <form onSubmit={handleTrack} className="ot-form">
          <div className="form-group">
            <label>Nomor Invoice</label>
            <input 
              type="text" 
              placeholder="Contoh: INV-2026xxxx-xxx" 
              value={invoice} 
              onChange={(e) => setInvoice(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Nomor WhatsApp</label>
            <input 
              type="text" 
              placeholder="08xxxx" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>
          {error && <div className="error-text">{error}</div>}
          <button type="submit" className="ot-btn" disabled={loading}>
            {loading ? 'Mencari Data Pesanan...' : 'Cari Pesanan'}
          </button>
        </form>

        {orderData && (
          <div className="ot-result">
            <div className="receipt-container">
              <div className="receipt-header">
                <h3>Invoice <span>#{orderData.nomor_invoice.split('-').pop()}</span></h3>
                <span className={`status-badge status-${orderData.status_transaksi}`} style={{ fontSize: '1rem', padding: '8px 16px', borderRadius: '50px' }}>
                  {orderData.status_transaksi?.split('_').join(' ').toUpperCase()}
                </span>
              </div>
              
              <div className="receipt-body">
                <div className="detail-row">
                  <span>Tanggal Transaksi</span>
                  <strong>{new Date(orderData.tanggal_transaksi).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                </div>
                <div className="detail-row">
                  <span>Metode Pembayaran</span>
                  <strong>{orderData.payment_type ? orderData.payment_type.replace('_', ' ').toUpperCase() : '-'}</strong>
                </div>
                <div className="detail-row">
                  <span>Status Pembayaran</span>
                  <strong>
                    {orderData.status_pembayaran === 'paid' ? (
                      <span style={{ color: '#16A34A' }}>LUNAS</span>
                    ) : orderData.status_pembayaran === 'pending' ? (
                      <span style={{ color: '#D97706' }}>BELUM DIBAYAR</span>
                    ) : (
                      <span style={{ color: '#DC2626' }}>{orderData.status_pembayaran?.toUpperCase()}</span>
                    )}
                  </strong>
                </div>
                {orderData.pengiriman && (
                  <>
                    <div className="detail-row">
                      <span>Status Pengiriman</span>
                      <strong>{orderData.pengiriman.status_pengiriman?.replace('_', ' ').toUpperCase() || '-'}</strong>
                    </div>
                    {orderData.pengiriman.nomor_resi && (
                      <div className="detail-row">
                        <span>Nomor Resi</span>
                        <strong>{orderData.pengiriman.nomor_resi}</strong>
                      </div>
                    )}
                  </>
                )}
                
                <div className="items-list">
                  <h4>Ringkasan Pesanan</h4>
                  <ul>
                    {orderData.details?.map((item: any) => (
                      <li key={item.id_detail}>
                        <span>{item.product?.nama_product}</span>
                        <strong>x{item.jumlah || item.qty || 1}</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="detail-row total-row">
                  <span>Total Tagihan</span>
                  <strong>Rp {Number(orderData.total_pembayaran || 0).toLocaleString('id-ID')}</strong>
                </div>

                {orderData.status_transaksi === 'menunggu_pembayaran' && (
                  <div className="action-box">
                    <span className="warning-icon">⏳</span>
                    <p className="warning-text">Menunggu Pembayaran</p>
                    <p style={{ color: '#92400e', marginBottom: '10px' }}>
                      Selesaikan pembayaran Anda untuk segera memproses pesanan ini.
                    </p>
                    
                    <div className="action-btn-wrapper">
                      <button 
                        onClick={handleContinuePayment}
                        className="pay-continue-btn"
                      >
                        Lanjutkan Pembayaran
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;

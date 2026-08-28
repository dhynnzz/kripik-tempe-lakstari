import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import './OrderManager.css';

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any | null>(null);

  const fetchOrders = async (page: number = 1) => {
    const data = await apiService.getOrders(page);
    if (data && data.data) {
      setOrders(data.data);
      setCurrentPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
      setTotalOrders(data.total || 0);
    } else {
      setOrders(Array.isArray(data) ? data : []);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const filteredOrders = orders.filter((o: any) => {
    if (statusFilter === 'Semua') return true;
    const normalizedFilter = statusFilter.toLowerCase().replace(/ /g, '_');
    return o.status_transaksi === normalizedFilter;
  });

  const handleStatusChange = async (id: number, newStatus: string) => {
    const success = await apiService.updateOrderStatus(id, { status_transaksi: newStatus });
    if(success) fetchOrders();
  };

  return (
    <div className="order-manager">
      <div className="om-header">
        <div>
          <h2>Daftar Pesanan Masuk</h2>
          <p>Pantau transaksi masuk, konfirmasi pembayaran, dan ubah status pengiriman paket.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="om-filter-tabs">
        {['Semua', 'Menunggu Pembayaran', 'Diproses', 'Dikemas', 'Siap Dikirim', 'Dikirim', 'Selesai', 'Dibatalkan'].map((status) => (
          <button
            key={status}
            className={`filter-tab-btn ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="admin-card om-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>No. Pesanan</th>
                <th>Pemesan</th>
                <th>Detail Barang</th>
                <th>Total Bayar</th>
                <th>Tanggal Order</th>
                <th>Pembayaran (Midtrans)</th>
                <th>Status Transaksi</th>
                <th>Ubah Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order: any) => (
                <tr key={order.id_transaksi}>
                  <td className="font-bold">{order.nomor_invoice}</td>
                  <td>
                    <div className="customer-cell">
                      <strong>{order.pelanggan?.nama_pelanggan || '-'}</strong>
                      <span>{order.pelanggan?.no_hp || '-'}</span>
                    </div>
                  </td>
                  <td>
                    {order.details && order.details.map((d: any) => `${d.product?.nama_product || 'Produk'} x${d.qty}`).join(', ')}
                  </td>
                  <td className="font-bold">Rp {order.total_pembayaran?.toLocaleString('id-ID')}</td>
                  <td><span className="date-text">{new Date(order.tanggal_transaksi).toLocaleDateString('id-ID')}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                        {order.midtrans_payment_type ? order.midtrans_payment_type.replace(/_/g, ' ').toUpperCase() : (order.payment_type ? order.payment_type.toUpperCase() : '-')}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: order.midtrans_transaction_status === 'settlement' ? '#16A34A' : (order.midtrans_transaction_status === 'pending' ? '#D97706' : '#DC2626') }}>
                        {order.status_pembayaran === 'paid' ? 'LUNAS' : (order.midtrans_transaction_status ? order.midtrans_transaction_status.toUpperCase() : 'BELUM BAYAR')}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                        ID: {order.midtrans_transaction_id || '-'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${order.status_transaksi}`}>
                      {order.status_transaksi?.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-dropdown"
                      value={order.status_transaksi}
                      onChange={(e) => handleStatusChange(order.id_transaksi, e.target.value)}
                    >
                      <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
                      <option value="diproses">Diproses</option>
                      <option value="dikemas">Dikemas</option>
                      <option value="siap_dikirim">Siap Dikirim</option>
                      <option value="dikirim">Dikirim</option>
                      <option value="selesai">Selesai</option>
                      <option value="dibatalkan">Dibatalkan</option>
                    </select>
                  </td>
                  <td>
                    <button 
                      onClick={() => setSelectedOrderDetail(order)}
                      style={{ background: 'var(--primary-dark)', color: 'var(--primary-accent)', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {lastPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem', gap: '0.5rem', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748b', marginRight: '1rem' }}>
              Total: {totalOrders} pesanan
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage === 1 ? '#f8fafc' : '#ffffff', color: currentPage === 1 ? '#94a3b8' : '#334155', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
            >
              Sebelumnya
            </button>
            <span style={{ padding: '0.25rem 0.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
              Halaman {currentPage} dari {lastPage}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
              disabled={currentPage === lastPage}
              style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage === lastPage ? '#f8fafc' : '#ffffff', color: currentPage === lastPage ? '#94a3b8' : '#334155', cursor: currentPage === lastPage ? 'not-allowed' : 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>

      {/* MODAL DETAIL PESANAN */}
      {selectedOrderDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem' }}>Detail Pesanan: <span style={{ color: 'var(--primary-dark)' }}>{selectedOrderDetail.nomor_invoice}</span></h2>
              <button onClick={() => setSelectedOrderDetail(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Kolom Kiri: Info Pelanggan & Alamat */}
              <div>
                <h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>Informasi Pelanggan</h3>
                <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ margin: 0 }}><strong>Nama:</strong> {selectedOrderDetail.pelanggan?.nama_pelanggan || '-'}</p>
                  <p style={{ margin: 0 }}><strong>No. HP:</strong> {selectedOrderDetail.pelanggan?.no_hp || '-'}</p>
                  <p style={{ margin: 0 }}><strong>Email:</strong> {selectedOrderDetail.pelanggan?.email || '-'}</p>
                </div>

                <h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px', marginTop: '24px' }}>Alamat Pengiriman</h3>
                <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ margin: 0 }}><strong>Penerima:</strong> {selectedOrderDetail.alamat?.nama_penerima || selectedOrderDetail.pelanggan?.nama_pelanggan}</p>
                  <p style={{ margin: 0 }}><strong>No. HP:</strong> {selectedOrderDetail.alamat?.no_hp_penerima || selectedOrderDetail.pelanggan?.no_hp}</p>
                  <p style={{ margin: 0, lineHeight: '1.5' }}><strong>Alamat:</strong> {selectedOrderDetail.alamat?.alamat_lengkap || '-'}<br/>
                    {selectedOrderDetail.alamat?.kecamatan}, {selectedOrderDetail.alamat?.kota}, {selectedOrderDetail.alamat?.provinsi} {selectedOrderDetail.alamat?.kode_pos}
                  </p>
                  {selectedOrderDetail.alamat?.catatan && (
                    <p style={{ margin: 0, marginTop: '4px', fontStyle: 'italic', color: '#d97706' }}>Catatan: {selectedOrderDetail.alamat.catatan}</p>
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Info Pembayaran & Pengiriman */}
              <div>
                <h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>Informasi Pembayaran</h3>
                <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ margin: 0 }}><strong>Metode Pembayaran:</strong> {(selectedOrderDetail.midtrans_payment_type || selectedOrderDetail.payment_type || '-').replace(/_/g, ' ').toUpperCase()}</p>
                  <p style={{ margin: 0 }}><strong>Midtrans Order ID:</strong> {selectedOrderDetail.midtrans_order_id || '-'}</p>
                  <p style={{ margin: 0 }}><strong>Midtrans Trx ID:</strong> {selectedOrderDetail.midtrans_transaction_id || '-'}</p>
                  <p style={{ margin: 0 }}><strong>Status Pembayaran:</strong> <span style={{ fontWeight: 600, color: selectedOrderDetail.status_pembayaran === 'paid' ? '#16A34A' : '#DC2626' }}>{selectedOrderDetail.status_pembayaran === 'paid' ? 'LUNAS' : 'BELUM LUNAS / PENDING'}</span></p>
                  <p style={{ margin: 0 }}><strong>Waktu Transaksi:</strong> {new Date(selectedOrderDetail.tanggal_transaksi).toLocaleString('id-ID')}</p>
                </div>

                <h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px', marginTop: '24px' }}>Info Kurir</h3>
                <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ margin: 0 }}><strong>Kurir:</strong> {selectedOrderDetail.pengiriman?.kurir || '-'} ({selectedOrderDetail.pengiriman?.layanan_kurir || '-'})</p>
                  <p style={{ margin: 0 }}><strong>Resi:</strong> {selectedOrderDetail.pengiriman?.nomor_resi || 'Belum diinput'}</p>
                  <p style={{ margin: 0 }}><strong>Status Kurir:</strong> {selectedOrderDetail.pengiriman?.status_pengiriman?.replace(/_/g, ' ') || '-'}</p>
                </div>
              </div>
            </div>

            {/* Tabel Produk */}
            <h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>Daftar Produk</h3>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Produk</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Harga</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Qty</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrderDetail.details?.map((d: any, index: number) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{d.nama_product}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Berat: {d.berat_product}g</div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>Rp {parseFloat(d.harga_product).toLocaleString('id-ID')}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{d.jumlah}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Rp {parseFloat(d.subtotal).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rincian Total */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.95rem' }}>
              <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>Total Harga Barang:</span>
                  <span style={{ fontWeight: 600 }}>Rp {parseFloat(selectedOrderDetail.subtotal).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>Total Ongkos Kirim:</span>
                  <span style={{ fontWeight: 600 }}>Rp {parseFloat(selectedOrderDetail.biaya_pengiriman).toLocaleString('id-ID')}</span>
                </div>
                {parseFloat(selectedOrderDetail.diskon) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                    <span>Diskon:</span>
                    <span style={{ fontWeight: 600 }}>- Rp {parseFloat(selectedOrderDetail.diskon).toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #cbd5e1', paddingTop: '12px', marginTop: '4px', fontSize: '1.1rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Total Pembayaran:</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>Rp {parseFloat(selectedOrderDetail.total_pembayaran).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'right' }}>
              <button 
                onClick={() => setSelectedOrderDetail(null)}
                style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;

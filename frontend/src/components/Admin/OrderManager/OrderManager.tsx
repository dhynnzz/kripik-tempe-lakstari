import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { apiService } from '../../../services/api';
import { printReceipt } from '../../../utils/printReceipt';
import './OrderManager.css';
import '../ShipmentManager/ShipmentManager.css';

const STATUS_LABELS: Record<string, string> = {
  menunggu_pembayaran: 'Menunggu Pembayaran',
  diproses: 'Diproses',
  dikemas: 'Dikemas',
  siap_dikirim: 'Siap Dikirim',
  dikirim: 'Dikirim',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
};

const formatRupiah = (n: number | string) =>
  'Rp ' + Number(n).toLocaleString('id-ID');

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const formatDateTime = (d: string) =>
  new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async (page: number = 1, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await apiService.getOrders(page);
      if (data && data.data) {
        setOrders(data.data);
        setCurrentPage(data.current_page || 1);
        setLastPage(data.last_page || 1);
        setTotalOrders(data.total || 0);
      } else {
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, true);
  }, [currentPage]);

  const getStatusCount = (tab: string) => {
    if (tab === 'Semua') return orders.length;
    const normalized = tab.toLowerCase().replace(/ /g, '_');
    return orders.filter((o: any) => o.status_transaksi === normalized).length;
  };

  const filteredOrders = orders.filter((o: any) => {
    if (statusFilter !== 'Semua') {
      const normalizedFilter = statusFilter.toLowerCase().replace(/ /g, '_');
      if (o.status_transaksi !== normalizedFilter) return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const invoice = (o.nomor_invoice || '').toLowerCase();
    const name = (o.pelanggan?.nama_pelanggan || '').toLowerCase();
    const phone = (o.pelanggan?.no_hp || '').toLowerCase();
    return invoice.includes(q) || name.includes(q) || phone.includes(q);
  });

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingId(id);

    // Optimistic update
    setOrders((prev) =>
      prev.map((o: any) =>
        o.id_transaksi === id ? { ...o, status_transaksi: newStatus } : o
      )
    );

    const success = await apiService.updateOrderStatus(id, { status_transaksi: newStatus });
    if (success) {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      Toast.fire({
        icon: 'success',
        title: 'Status pesanan berhasil diperbarui'
      });
      await fetchOrders(currentPage, false);
    } else {
      await fetchOrders(currentPage, false);
    }
    setUpdatingId(null);
  };

  const getPaymentLabel = (order: any) => {
    if (order.status_pembayaran === 'paid') return { text: 'Lunas', color: '#16A34A' };
    if (order.status_pembayaran === 'pending') return { text: 'Belum bayar', color: '#D97706' };
    if (order.status_pembayaran === 'cancelled') return { text: 'Dibatalkan', color: '#DC2626' };
    if (order.status_pembayaran === 'expired') return { text: 'Kadaluarsa', color: '#94A3B8' };
    if (order.status_pembayaran === 'failed') return { text: 'Gagal', color: '#DC2626' };
    if (order.status_pembayaran === 'refunded') return { text: 'Refund', color: '#7C3AED' };
    return { text: order.status_pembayaran || '-', color: '#64748B' };
  };

  return (
    <div className="order-manager shipment-manager-container">
      {/* Header */}
      <div className="shipment-header-bar">
        <div className="shipment-header-title">
          <h2>Daftar Pesanan Masuk</h2>
          <p>Pantau transaksi masuk, konfirmasi pembayaran, dan ubah status pengiriman paket.</p>
        </div>
        <div className="om-header-search-wrap">
          <input
            type="text"
            className="om-header-search-input"
            placeholder="🔍 Cari invoice / pemesan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="om-search-clear-btn" onClick={() => setSearchQuery('')} title="Hapus pencarian">✕</button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="om-filter-tabs">
        {['Semua', 'Menunggu Pembayaran', 'Diproses', 'Dikemas', 'Siap Dikirim', 'Dikirim', 'Selesai', 'Dibatalkan'].map((status) => {
          const count = getStatusCount(status);
          return (
            <button
              key={status}
              className={`filter-tab-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              <span>{status}</span>
              {count > 0 && <span className="om-tab-counter">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* ═══════════ DAFTAR KARTU PESANAN (DESKTOP & MOBILE) ═══════════ */}
      <div className="om-cards-list">
        {isLoading ? (
          <div className="om-loading-state">
            <div className="om-spinner" />
            <span>Memuat pesanan...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="om-empty-card">
            <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>📭</span>
            <p style={{ fontWeight: 600, color: '#64748B' }}>
              {searchQuery ? `Tidak ada pesanan yang cocok dengan "${searchQuery}"` : 'Belum ada pesanan untuk status ini.'}
            </p>
            {searchQuery && (
              <button
                className="om-empty-reset-btn"
                onClick={() => setSearchQuery('')}
              >
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((order: any) => {
            const pay = getPaymentLabel(order);
            return (
              <div key={order.id_transaksi} className="om-mob-card">
                {/* Header Kartu */}
                <div className="om-mob-card-header">
                  <span className="om-mob-invoice">#{order.nomor_invoice}</span>
                  <span className="om-mob-date">🗓 {formatDate(order.tanggal_transaksi)}</span>
                </div>

                {/* Badan Kartu */}
                <div className="om-mob-card-body">
                  <div className="om-mob-customer-row">
                    <div className="om-mob-customer">
                      <strong className="om-mob-name">{order.pelanggan?.nama_pelanggan || '-'}</strong>
                      {order.pelanggan?.no_hp && (
                        <span className="om-mob-phone">({order.pelanggan.no_hp})</span>
                      )}
                    </div>
                    <span className="om-mob-total">{formatRupiah(order.total_pembayaran)}</span>
                  </div>

                  <div className="om-mob-items">
                    📦 {order.details && order.details.length > 0 ? (
                      order.details.map((d: any) =>
                        `${d.product?.nama_product || d.nama_product || 'Produk'} x${d.jumlah || d.qty || 1}`
                      ).join(', ')
                    ) : (
                      'Tidak ada rincian produk'
                    )}
                  </div>

                  <div className="om-mob-badges">
                    <span className={`status-badge status-${order.status_transaksi}`}>
                      {STATUS_LABELS[order.status_transaksi] || order.status_transaksi}
                    </span>
                    <span className="om-mob-pay-badge" style={{ color: pay.color, borderColor: pay.color }}>
                      {pay.text}
                    </span>
                  </div>
                </div>

                {/* Footer Kartu */}
                <div className="om-mob-card-footer">
                  <div className="om-mob-status-wrap">
                    <label className="om-mob-status-label">UBAH STATUS:</label>
                    <select
                      className="om-mob-status-select"
                      value={order.status_transaksi}
                      disabled={updatingId === order.id_transaksi}
                      onChange={(e) => handleStatusChange(order.id_transaksi, e.target.value)}
                    >
                      {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="om-mob-actions">
                    <button className="om-mob-btn om-mob-btn-detail" onClick={() => setSelectedOrderDetail(order)}>
                      👁 Detail
                    </button>
                    <button className="om-mob-btn om-mob-btn-print" onClick={() => printReceipt(order)}>
                      🖨️ Struk
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {lastPage > 1 && (
          <div className="om-pagination">
            <span className="om-page-info">Total: {totalOrders || orders.length} pesanan</span>
            <button className="om-page-btn" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>‹ Sebelumnya</button>
            <span className="om-page-current">Halaman {currentPage} dari {lastPage}</span>
            <button className="om-page-btn" onClick={() => setCurrentPage(p => Math.min(p + 1, lastPage))} disabled={currentPage === lastPage}>Selanjutnya ›</button>
          </div>
        )}
      </div>

      {/* ═══════════ MODAL DETAIL PESANAN ═══════════ */}
      {selectedOrderDetail && (
        <div className="om-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrderDetail(null); }}>
          <div className="om-modal">
            <div className="om-modal-header">
              <h2>Detail Pesanan: <span>{selectedOrderDetail.nomor_invoice}</span></h2>
              <button className="om-modal-close" onClick={() => setSelectedOrderDetail(null)}>✕</button>
            </div>

            <div className="om-modal-body">
              <div className="om-modal-grid">
                {/* Kolom Kiri */}
                <div className="om-modal-section">
                  <h3 className="om-modal-section-title">Informasi Pelanggan</h3>
                  <div className="om-modal-info-list">
                    <div className="om-modal-info-row"><span>Nama</span><strong>{selectedOrderDetail.pelanggan?.nama_pelanggan || '-'}</strong></div>
                    <div className="om-modal-info-row"><span>No. HP</span><strong>{selectedOrderDetail.pelanggan?.no_hp || '-'}</strong></div>
                    <div className="om-modal-info-row"><span>Email</span><strong>{selectedOrderDetail.pelanggan?.email || '-'}</strong></div>
                  </div>

                  <h3 className="om-modal-section-title" style={{ marginTop: '20px' }}>📍 Alamat Pengiriman</h3>
                  <div className="om-modal-info-list">
                    <div className="om-modal-info-row"><span>Penerima</span><strong>{selectedOrderDetail.alamat?.nama_penerima || selectedOrderDetail.pelanggan?.nama_pelanggan}</strong></div>
                    <div className="om-modal-info-row"><span>No. HP</span><strong>{selectedOrderDetail.alamat?.no_hp_penerima || selectedOrderDetail.pelanggan?.no_hp}</strong></div>
                    <div className="om-modal-info-row om-modal-info-col">
                      <span>Alamat</span>
                      <strong>
                        {selectedOrderDetail.alamat?.alamat_lengkap || '-'}<br />
                        {selectedOrderDetail.alamat?.kecamatan}, {selectedOrderDetail.alamat?.kota}<br />
                        {selectedOrderDetail.alamat?.provinsi} {selectedOrderDetail.alamat?.kode_pos}
                      </strong>
                    </div>
                    {selectedOrderDetail.alamat?.catatan && (
                      <div className="om-modal-info-row om-modal-catatan">
                        <span>📝</span><em>{selectedOrderDetail.alamat.catatan}</em>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className="om-modal-section">
                  <h3 className="om-modal-section-title">💳 Informasi Pembayaran</h3>
                  <div className="om-modal-info-list">
                    <div className="om-modal-info-row"><span>Metode</span><strong>{(selectedOrderDetail.midtrans_payment_type || selectedOrderDetail.payment_type || selectedOrderDetail.metode_pembayaran || '-').replace(/_/g, ' ').toUpperCase()}</strong></div>
                    <div className="om-modal-info-row">
                      <span>Status Bayar</span>
                      <strong style={{ color: getPaymentLabel(selectedOrderDetail).color }}>{getPaymentLabel(selectedOrderDetail).text}</strong>
                    </div>
                    <div className="om-modal-info-row"><span>Midtrans Order ID</span><strong className="om-mono">{selectedOrderDetail.midtrans_order_id || '-'}</strong></div>
                    <div className="om-modal-info-row"><span>Midtrans Trx ID</span><strong className="om-mono">{selectedOrderDetail.midtrans_transaction_id || '-'}</strong></div>
                    <div className="om-modal-info-row"><span>Waktu</span><strong>{formatDateTime(selectedOrderDetail.tanggal_transaksi)}</strong></div>
                  </div>

                  <h3 className="om-modal-section-title" style={{ marginTop: '20px' }}>🚚 Info Kurir</h3>
                  <div className="om-modal-info-list">
                    <div className="om-modal-info-row"><span>Kurir</span><strong>{selectedOrderDetail.pengiriman?.kurir || '-'} ({selectedOrderDetail.pengiriman?.layanan_kurir || '-'})</strong></div>
                    <div className="om-modal-info-row"><span>No. Resi</span><strong className="om-mono">{selectedOrderDetail.pengiriman?.nomor_resi || 'Belum diinput'}</strong></div>
                    <div className="om-modal-info-row"><span>Status Kurir</span><strong>{selectedOrderDetail.pengiriman?.status_pengiriman?.replace(/_/g, ' ') || '-'}</strong></div>
                  </div>
                </div>
              </div>

              {/* Daftar Produk */}
              <h3 className="om-modal-section-title" style={{ marginTop: '8px' }}>🛒 Daftar Produk</h3>
              <div className="om-modal-product-table-wrap">
                <table className="om-modal-product-table">
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Harga</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderDetail.details?.map((d: any, index: number) => (
                      <tr key={index}>
                        <td>
                          <div className="om-product-name">{d.nama_product}</div>
                          <div className="om-product-weight">Berat: {d.berat_product}g</div>
                        </td>
                        <td>{formatRupiah(d.harga_product)}</td>
                        <td className="om-qty">{d.jumlah}</td>
                        <td className="om-product-subtotal">{formatRupiah(d.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="om-modal-totals">
                <div className="om-total-row"><span>Total Harga Barang</span><span>{formatRupiah(selectedOrderDetail.subtotal)}</span></div>
                <div className="om-total-row"><span>Ongkos Kirim</span><span>{formatRupiah(selectedOrderDetail.biaya_pengiriman)}</span></div>
                {parseFloat(selectedOrderDetail.diskon) > 0 && (
                  <div className="om-total-row om-total-diskon"><span>Diskon</span><span>- {formatRupiah(selectedOrderDetail.diskon)}</span></div>
                )}
                <div className="om-total-row om-total-grand">
                  <span>Total Pembayaran</span>
                  <span>{formatRupiah(selectedOrderDetail.total_pembayaran)}</span>
                </div>
              </div>
            </div>

            <div className="om-modal-footer">
              <button className="om-modal-btn-print" onClick={() => printReceipt(selectedOrderDetail)}>
                🖨️ Cetak Struk
              </button>
              <button className="om-modal-btn-close" onClick={() => setSelectedOrderDetail(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;

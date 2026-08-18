import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import './OrderManager.css';

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  const fetchOrders = async () => {
    const data = await apiService.getOrders();
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
                        {order.midtrans_transaction_status ? order.midtrans_transaction_status.toUpperCase() : 'BELUM BAYAR'}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManager;

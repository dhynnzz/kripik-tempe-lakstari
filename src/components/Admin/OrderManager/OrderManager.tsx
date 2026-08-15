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

  const filteredOrders = orders.filter((o: any) =>
    statusFilter === 'Semua' ? true : o.status_transaksi === statusFilter
  );

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
        {['Semua', 'Baru', 'Diproses', 'Dikirim', 'Selesai'].map((status) => (
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
                    <span className={`status-badge status-${order.status_transaksi?.toLowerCase().replace(' ', '-')}`}>
                      {order.status_transaksi}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-dropdown"
                      value={order.status_transaksi}
                      onChange={(e) => handleStatusChange(order.id_transaksi, e.target.value)}
                    >
                      <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                      <option value="Diproses">Diproses</option>
                      <option value="Dikemas">Dikemas</option>
                      <option value="Siap Dikirim">Siap Dikirim</option>
                      <option value="Dikirim">Dikirim</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Dibatalkan">Dibatalkan</option>
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

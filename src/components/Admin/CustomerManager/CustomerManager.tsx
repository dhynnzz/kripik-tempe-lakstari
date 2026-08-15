import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import './CustomerManager.css';

const CustomerManager: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);

  const fetchCustomers = async () => {
    const data = await apiService.getCustomers();
    setCustomers(data);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    const success = await apiService.updateCustomerStatus(id, newStatus);
    if(success) fetchCustomers();
  };

  return (
    <div className="customer-manager">
      <div className="cm-header">
        <div>
          <h2>Data Pelanggan</h2>
          <p>Kelola data pelanggan yang terdaftar dan yang pernah bertransaksi.</p>
        </div>
      </div>

      <div className="admin-card cm-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama Pelanggan</th>
                <th>Kontak (HP & Email)</th>
                <th>Jumlah Order</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any) => (
                <tr key={c.id_pelanggan}>
                  <td className="font-bold">{c.nama_pelanggan}</td>
                  <td>
                    <div className="contact-cell">
                      <span>{c.no_hp}</span>
                      {c.email && <span className="email-text">{c.email}</span>}
                    </div>
                  </td>
                  <td>{c.transaksi_count || 0} Kali</td>
                  <td>
                    <span className={`status-badge status-${c.status_pelanggan?.toLowerCase() === 'aktif' ? 'baru' : 'selesai'}`}>
                      {c.status_pelanggan}
                    </span>
                  </td>
                  <td>
                     <select
                      className="status-dropdown"
                      value={c.status_pelanggan}
                      onChange={(e) => handleStatusChange(c.id_pelanggan, e.target.value)}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Blacklist">Blacklist</option>
                    </select>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{textAlign: 'center', padding: '20px'}}>Belum ada pelanggan terdaftar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerManager;

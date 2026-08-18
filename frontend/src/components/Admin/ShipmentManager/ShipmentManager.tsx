import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import './ShipmentManager.css';

const ShipmentManager: React.FC = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [resiInput, setResiInput] = useState('');

  const fetchShipments = async () => {
    const data = await apiService.getShipments();
    setShipments(data);
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    const success = await apiService.updateShipment(id, { status_pengiriman: newStatus });
    if(success) fetchShipments();
  };

  const handleUpdateResi = async (id: number) => {
    if(!resiInput) return;
    const success = await apiService.updateShipment(id, { nomor_resi: resiInput });
    if(success) {
      alert('Resi berhasil diperbarui');
      setResiInput('');
      setSelectedShipment(null);
      fetchShipments();
    }
  };

  return (
    <div className="shipment-manager-container">
      {/* Header Bar */}
      <div className="shipment-header-bar">
        <div className="shipment-header-title">
          <h2>Menu Pengiriman</h2>
          <p>Pantau nomor resi kurir, status ekspedisi, ongkir, dan pengiriman.</p>
        </div>
      </div>

      {/* Tabel Pengiriman */}
      <div className="shipment-table-card">
        <table className="shipment-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Pelanggan</th>
              <th>Kurir & Layanan</th>
              <th>Nomor Resi</th>
              <th>Status Pengiriman</th>
              <th>Aksi Admin</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s: any) => (
              <tr key={s.id_pengiriman}>
                <td><strong style={{ color: 'var(--primary-dark)' }}>{s.transaksi?.nomor_invoice}</strong></td>
                <td>{s.transaksi?.pelanggan?.nama_pelanggan}</td>
                <td>
                  <span className="courier-badge">{s.kurir || 'Kurir Lokal'}</span> <small>({s.layanan || 'REG'})</small>
                </td>
                <td><code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>{s.nomor_resi || 'Belum diisi'}</code></td>
                <td>
                  <span style={{
                    background: s.status_pengiriman === 'Terkirim' ? '#DCFCE7' : s.status_pengiriman === 'Dalam Perjalanan' ? '#DBEAFE' : '#FEF3C7',
                    color: s.status_pengiriman === 'Terkirim' ? '#166534' : s.status_pengiriman === 'Dalam Perjalanan' ? '#1E40AF' : '#92400E',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700
                  }}>
                    {s.status_pengiriman || 'Menunggu Pickup'}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => setSelectedShipment(s)}
                    style={{
                      background: 'var(--primary-dark)',
                      color: 'var(--primary-accent)',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Kelola Pengiriman
                  </button>
                </td>
              </tr>
            ))}
            {shipments.length === 0 && (
                <tr>
                  <td colSpan={6} style={{textAlign: 'center', padding: '20px'}}>Belum ada data pengiriman.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Kelola Pengiriman */}
      {selectedShipment && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#fff', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '500px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--primary-dark)' }}>Kelola Pengiriman: {selectedShipment.transaksi?.nomor_invoice}</h3>
              <button onClick={() => setSelectedShipment(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold'}}>Input Nomor Resi Baru</label>
                <div style={{display: 'flex', gap: '10px'}}>
                  <input type="text" value={resiInput} onChange={e => setResiInput(e.target.value)} placeholder="Misal: JT8899001122" style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  <button onClick={() => handleUpdateResi(selectedShipment.id_pengiriman)} style={{ background: 'var(--primary-green)', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '6px', cursor: 'pointer' }}>Simpan Resi</button>
                </div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
               <label style={{display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold'}}>Ubah Status Pengiriman</label>
               <select 
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  value={selectedShipment.status_pengiriman}
                  onChange={(e) => {
                     handleStatusChange(selectedShipment.id_pengiriman, e.target.value);
                     setSelectedShipment({...selectedShipment, status_pengiriman: e.target.value});
                  }}
               >
                  <option value="Menunggu Pickup">Menunggu Pickup</option>
                  <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                  <option value="Terkirim">Terkirim</option>
               </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
               <button onClick={() => setSelectedShipment(null)} style={{ background: '#E2E8F0', color: '#1E293B', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentManager;

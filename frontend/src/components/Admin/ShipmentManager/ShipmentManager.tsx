import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import './ShipmentManager.css';
import Swal from 'sweetalert2';


const ShipmentManager: React.FC = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [selectedShipmentDetail, setSelectedShipmentDetail] = useState<any | null>(null);
  const [resiInput, setResiInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalShipments, setTotalShipments] = useState(0);

  const fetchShipments = async (page: number = 1) => {
    setIsLoading(true);
    const data = await apiService.getShipments(page);
    if (data && data.data) {
      setShipments(data.data);
      setCurrentPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
      setTotalShipments(data.total || 0);
    } else {
      setShipments(Array.isArray(data) ? data : []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchShipments(currentPage);
  }, [currentPage]);

  const handleSaveChanges = async () => {
    if (!selectedShipment) return;

    if (selectedShipment.status_pengiriman === 'dibatalkan' || selectedShipment.status_pengiriman === 'Dibatalkan') {
      const result = await Swal.fire({
        title: 'Batalkan Pengiriman?',
        text: 'Pesanan di Biteship akan dibatalkan otomatis.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#64748B',
        confirmButtonText: 'Ya, Batalkan',
        cancelButtonText: 'Kembali'
      });
      if (!result.isConfirmed) return; // Batal simpan jika tidak yakin
    }

    const payload = {
      status_pengiriman: selectedShipment.status_pengiriman,
      nomor_resi: resiInput
    };
    const success = await apiService.updateShipment(selectedShipment.id_pengiriman, payload);
    if(success) {
      Swal.fire({
        title: 'Berhasil',
        text: 'Perubahan berhasil disimpan',
        icon: 'success',
        confirmButtonColor: 'var(--primary-dark)'
      });
      setSelectedShipment(null);
      fetchShipments(currentPage);
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
            {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', color: '#64748b' }}>
                      <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>Memuat data pengiriman...</span>
                      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                  </td>
                </tr>
            ) : shipments.length > 0 ? (
                shipments.map((s: any) => (
              <tr key={s.id_pengiriman}>
                <td><strong style={{ color: 'var(--primary-dark)' }}>{s.transaksi?.nomor_invoice}</strong></td>
                <td>{s.transaksi?.pelanggan?.nama_pelanggan}</td>
                <td>
                  <span className="courier-badge">{s.kurir || 'Kurir Lokal'}</span> <small>({s.layanan || 'REG'})</small>
                </td>
                <td><code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>{s.nomor_resi || 'Belum diisi'}</code></td>
                <td>
                  <span style={{
                    background: (s.status_pengiriman === 'terkirim' || s.status_pengiriman === 'Selesai') ? '#DCFCE7' : s.status_pengiriman === 'dalam_perjalanan' ? '#DBEAFE' : s.status_pengiriman === 'dibatalkan' ? '#FEE2E2' : '#FEF3C7',
                    color: (s.status_pengiriman === 'terkirim' || s.status_pengiriman === 'Selesai') ? '#166534' : s.status_pengiriman === 'dalam_perjalanan' ? '#1E40AF' : s.status_pengiriman === 'dibatalkan' ? '#DC2626' : '#92400E',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700
                  }}>
                    {s.status_pengiriman === 'dibatalkan' ? 'Dibatalkan' : s.status_pengiriman === 'terkirim' ? 'Terkirim' : s.status_pengiriman === 'dalam_perjalanan' ? 'Dalam Perjalanan' : 'Menunggu Pickup'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      onClick={() => {
                        setSelectedShipment(s);
                        setResiInput(s.nomor_resi || '');
                      }}
                      style={{
                        background: '#e2e8f0',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Kelola Pengiriman
                    </button>
                    <button 
                      onClick={() => setSelectedShipmentDetail(s)}
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
                      Detail
                    </button>
                  </div>
                </td>
              </tr>
            ))) : (
                <tr>
                  <td colSpan={6} style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>Belum ada data pengiriman.</td>
                </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {lastPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem', gap: '0.5rem', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748b', marginRight: '1rem' }}>
              Total: {totalShipments} pengiriman
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
                </div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
               <label style={{display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold'}}>Ubah Status Pengiriman</label>
               <select 
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  value={selectedShipment.status_pengiriman}
                  onChange={(e) => {
                     setSelectedShipment({...selectedShipment, status_pengiriman: e.target.value});
                  }}
               >
                  <option value="menunggu_pickup">Menunggu Pickup</option>
                  <option value="dalam_perjalanan">Dalam Perjalanan</option>
                  <option value="terkirim">Terkirim</option>
                  <option value="dibatalkan">Dibatalkan</option>
               </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
               <button onClick={() => setSelectedShipment(null)} style={{ background: '#E2E8F0', color: '#1E293B', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}>Batal</button>
               <button onClick={handleSaveChanges} style={{ background: 'var(--primary-dark)', color: 'var(--primary-accent)', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Simpan</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Detail Pengiriman */}
      {selectedShipmentDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem' }}>Detail Pengiriman: <span style={{ color: 'var(--primary-dark)' }}>{selectedShipmentDetail.transaksi?.nomor_invoice}</span></h2>
              <button onClick={() => setSelectedShipmentDetail(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Kolom Kiri: Info Resi & Ekspedisi */}
              <div>
                <h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>Informasi Resi & Kurir</h3>
                <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ margin: 0 }}><strong>Kurir:</strong> {selectedShipmentDetail.kurir || '-'}</p>
                  <p style={{ margin: 0 }}><strong>Layanan:</strong> {selectedShipmentDetail.layanan_kurir || '-'}</p>
                  <p style={{ margin: 0 }}><strong>Nomor Resi:</strong> <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{selectedShipmentDetail.nomor_resi || 'Belum diisi'}</span></p>
                  <p style={{ margin: 0 }}><strong>Status:</strong> <span style={{ color: selectedShipmentDetail.status_pengiriman === 'Terkirim' ? '#16a34a' : '#d97706', fontWeight: 600 }}>{selectedShipmentDetail.status_pengiriman || '-'}</span></p>
                  <p style={{ margin: 0 }}><strong>Biaya Ongkir:</strong> Rp {parseFloat(selectedShipmentDetail.biaya_pengiriman || 0).toLocaleString('id-ID')}</p>
                  <p style={{ margin: 0 }}><strong>Berat Total:</strong> {selectedShipmentDetail.berat_total || 0} gram</p>
                </div>
              </div>

              {/* Kolom Kanan: Alamat Tujuan */}
              <div>
                <h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>Alamat Tujuan</h3>
                <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ margin: 0 }}><strong>Penerima:</strong> {selectedShipmentDetail.alamat?.nama_penerima || selectedShipmentDetail.transaksi?.pelanggan?.nama_pelanggan || '-'}</p>
                  <p style={{ margin: 0 }}><strong>No. HP:</strong> {selectedShipmentDetail.alamat?.no_hp_penerima || selectedShipmentDetail.transaksi?.pelanggan?.no_hp || '-'}</p>
                  <p style={{ margin: 0, lineHeight: '1.5' }}><strong>Alamat:</strong> {selectedShipmentDetail.alamat?.alamat_lengkap || '-'}<br/>
                    {selectedShipmentDetail.alamat?.kecamatan}, {selectedShipmentDetail.alamat?.kota}, {selectedShipmentDetail.alamat?.provinsi} {selectedShipmentDetail.alamat?.kode_pos}
                  </p>
                  {selectedShipmentDetail.alamat?.catatan && (
                    <p style={{ margin: 0, marginTop: '4px', fontStyle: 'italic', color: '#d97706' }}>Catatan: {selectedShipmentDetail.alamat.catatan}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Isi Paket (Daftar Produk) */}
            <h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>Isi Paket (Daftar Barang)</h3>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Produk</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Varian</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Qty</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Berat per item</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedShipmentDetail.transaksi?.details?.map((d: any, index: number) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{d.nama_product}</div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{d.product?.varian_rasa || '-'}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>{d.jumlah}x</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>{d.berat_product}g</td>
                    </tr>
                  ))}
                  {(!selectedShipmentDetail.transaksi?.details || selectedShipmentDetail.transaksi?.details.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ padding: '12px', textAlign: 'center', color: '#94a3b8' }}>Data produk tidak tersedia</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button 
                onClick={() => setSelectedShipmentDetail(null)}
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

export default ShipmentManager;

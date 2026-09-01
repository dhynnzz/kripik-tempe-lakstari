import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import './ReportManager.css';

const ReportManager: React.FC = () => {
  const [filterPeriod, setFilterPeriod] = useState<'hari' | 'minggu' | 'bulan' | 'tahun'>('bulan');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      const res = await apiService.getAnalyticsReport(filterPeriod);
      setData(res);
      setIsLoading(false);
    };
    fetchReport();
  }, [filterPeriod]);

  return (
    <div className="report-manager-container">
      {/* Header & Filter Rentang Waktu (Poin 11 PRD) */}
      <div className="report-filter-card">
        <div className="report-filter-title">
          <h2>Menu Laporan & Analytics Toko</h2>
          <p>Rekapitulasi Laporan Penjualan, Produk Terlaris, Status Transaksi, dan Pengiriman (Sesuai Poin 11 PRD).</p>
        </div>

        <div className="report-filter-controls">
          <label style={{ fontSize: '13px', fontWeight: 600 }}>Filter Periode:</label>
          <select 
            className="report-filter-select"
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value as any)}
          >
            <option value="hari">Hari Ini</option>
            <option value="minggu">Minggu Ini</option>
            <option value="bulan">Bulan Ini (Agustus 2026)</option>
            <option value="tahun">Tahun Ini (2026)</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
           <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
           <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
           <span>Memuat Laporan & Analytics...</span>
        </div>
      ) : (
        <>
          {/* Grid Summary Laporan Penjualan (Poin 11.A PRD) */}
          <div className="report-stats-grid">
            <div className="report-stat-card">
              <div className="report-stat-label">Total Omset Penjualan</div>
              <div className="report-stat-value" style={{ color: '#D97706' }}>
                Rp {data?.total_omset ? Number(data.total_omset).toLocaleString('id-ID') : '0'}
              </div>
              <small style={{ color: '#64748B' }}>{data?.total_omset > 0 ? 'Telah Dikonfirmasi' : 'Belum ada data'}</small>
            </div>

            <div className="report-stat-card">
              <div className="report-stat-label">Total Transaksi Selesai</div>
              <div className="report-stat-value">{data?.total_transaksi_selesai || 0} Transaksi</div>
              <small style={{ color: '#64748B' }}>{data?.persen_valid || 0}% Valid</small>
            </div>

            <div className="report-stat-card">
              <div className="report-stat-label">Total Produk Terjual</div>
              <div className="report-stat-value">{data?.total_produk_terjual || 0} bungkus</div>
              <small style={{ color: '#64748B' }}>{data?.total_produk_terjual > 0 ? 'Terkirim/Selesai' : 'Belum ada data'}</small>
            </div>

            <div className="report-stat-card">
              <div className="report-stat-label">Rata-Rata Nilai Transaksi</div>
              <div className="report-stat-value">
                Rp {data?.rata_rata_transaksi ? Number(data.rata_rata_transaksi).toLocaleString('id-ID') : '0'}
              </div>
              <small style={{ color: '#64748B' }}>Per Pembeli</small>
            </div>
          </div>

          {/* 2 Kolom Rekapitulasi Laporan Produk & Laporan Pengiriman (Poin 11.B & 11.D PRD) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* Laporan Produk Terlaris */}
            <div className="report-panel-card">
              <div className="report-panel-header">
                <h3>Laporan Produk Terlaris</h3>
              </div>
              <div className="table-responsive">
                <table className="report-mini-table">
                  <thead>
                    <tr>
                      <th>Nama Produk</th>
                      <th>Kategori</th>
                      <th style={{ textAlign: 'right' }}>Terjual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.produk_terlaris && data.produk_terlaris.length > 0 ? (
                      data.produk_terlaris.map((p: any, idx: number) => (
                        <tr key={idx}>
                          <td><strong>{p.nama_product}</strong></td>
                          <td>{p.kategori || '-'}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{p.total_terjual}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>Belum ada data produk terjual.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rekap Status Pengiriman */}
            <div className="report-panel-card">
              <div className="report-panel-header">
                <h3>Rekap Status Pengiriman</h3>
              </div>
              <div className="table-responsive">
                <table className="report-mini-table">
                  <thead>
                    <tr>
                      <th>Status Kurir (BetShip)</th>
                      <th style={{ textAlign: 'right' }}>Jumlah Transaksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.rekap_pengiriman && data.rekap_pengiriman.length > 0 ? (
                      data.rekap_pengiriman.map((rp: any, idx: number) => (
                        <tr key={idx}>
                          <td>
                            <span style={{
                              background: (rp.status_pengiriman === 'terkirim' || rp.status_pengiriman === 'selesai') ? '#DCFCE7' : rp.status_pengiriman === 'dalam_perjalanan' ? '#DBEAFE' : rp.status_pengiriman === 'dibatalkan' ? '#FEE2E2' : '#FEF3C7',
                              color: (rp.status_pengiriman === 'terkirim' || rp.status_pengiriman === 'selesai') ? '#166534' : rp.status_pengiriman === 'dalam_perjalanan' ? '#1E40AF' : rp.status_pengiriman === 'dibatalkan' ? '#DC2626' : '#92400E',
                              padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'inline-block'
                            }}>
                              {rp.status_pengiriman === 'dibatalkan' ? 'Dibatalkan' : rp.status_pengiriman === 'terkirim' ? 'Terkirim' : rp.status_pengiriman === 'dalam_perjalanan' ? 'Dalam Perjalanan' : (rp.status_pengiriman?.replace(/_/g, ' ').replace(/\b\w/g, (l:string) => l.toUpperCase()) || 'Menunggu Pickup')}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{rp.jumlah_transaksi} Pesanan</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>Belum ada data pengiriman.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default ReportManager;

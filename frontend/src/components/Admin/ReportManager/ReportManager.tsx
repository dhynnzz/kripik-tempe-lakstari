import { useState } from 'react';
import './ReportManager.css';

const ReportManager: React.FC = () => {
  const [filterPeriod, setFilterPeriod] = useState<'hari' | 'minggu' | 'bulan' | 'tahun'>('bulan');

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

      {/* Grid Summary Laporan Penjualan (Poin 11.A PRD) */}
      <div className="report-stats-grid">
        <div className="report-stat-card">
          <div className="report-stat-label">Total Omset Penjualan</div>
          <div className="report-stat-value" style={{ color: '#D97706' }}>Rp 0</div>
          <small style={{ color: '#64748B' }}>Belum ada data</small>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-label">Total Transaksi Selesai</div>
          <div className="report-stat-value">0 Transaksi</div>
          <small style={{ color: '#64748B' }}>0% Valid</small>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-label">Total Produk Terjual</div>
          <div className="report-stat-value">0 bungkus</div>
          <small style={{ color: '#64748B' }}>Belum ada data</small>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-label">Rata-Rata Nilai Transaksi</div>
          <div className="report-stat-value">Rp 0</div>
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
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>Belum ada data produk terjual.</td>
                </tr>
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
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>Belum ada data pengiriman.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportManager;

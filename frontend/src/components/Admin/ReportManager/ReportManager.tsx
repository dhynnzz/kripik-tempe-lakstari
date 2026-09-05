import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../services/api';
import { SalesAreaChart } from '../DashboardHome/SalesAreaChart';
import './ReportManager.css';

type ReportPeriod = 'hari' | 'minggu' | 'bulan' | 'tahun';

interface TopProduct {
  nama_product: string;
  kategori?: string;
  total_terjual: number;
}

interface ShippingBreakdown {
  status_pengiriman: string;
  jumlah_transaksi: number;
}

interface AnalyticsData {
  total_omset: number;
  total_transaksi_selesai: number;
  persen_valid: number;
  total_produk_terjual: number;
  rata_rata_transaksi: number;
  produk_terlaris: TopProduct[];
  rekap_pengiriman: ShippingBreakdown[];
}

const ReportManager: React.FC = () => {
  const [filterPeriod, setFilterPeriod] = useState<ReportPeriod>('bulan');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getAnalyticsReport(filterPeriod);
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error('Gagal memuat laporan:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filterPeriod]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport, refreshKey]);

  // Format currency
  const formatRupiah = (amount: number) => {
    return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
  };

  // Trigger print
  const handlePrint = () => {
    window.print();
  };

  const getPeriodLabel = (p: ReportPeriod) => {
    switch (p) {
      case 'hari': return 'Hari Ini';
      case 'minggu': return 'Minggu Ini';
      case 'bulan': return 'Bulan Ini';
      case 'tahun': return 'Tahun Ini';
    }
  };

  const formatShipmentStatus = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'terkirim' || s === 'selesai') return 'Terkirim / Selesai';
    if (s === 'dalam_perjalanan' || s === 'dikirim') return 'Dalam Perjalanan';
    if (s === 'dibatalkan') return 'Dibatalkan';
    return 'Menunggu Pickup';
  };

  return (
    <div className="report-manager-root">
      {/* 1. Header (Plain White - No Gradient) */}
      <div className="rm-header-plain no-print">
        <div className="rm-header-titles">
          <h2>Menu Laporan & Analytics Toko</h2>
          <p>Rekapitulasi penjualan, produk terlaris, dan distribusi status pengiriman.</p>
        </div>

        <div className="rm-header-actions">
          <button
            type="button"
            className="btn-rm-plain"
            onClick={handlePrint}
            title="Cetak Laporan ke PDF / Kertas"
          >
            Cetak Laporan
          </button>

          <button
            type="button"
            className="btn-rm-plain"
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={isLoading}
          >
            {isLoading ? 'Memuat...' : 'Segarkan Data'}
          </button>
        </div>
      </div>

      {/* 2. Period Filter Bar (Plain & Clean) */}
      <div className="rm-filter-card-plain no-print">
        <div className="rm-filter-left">
          <span className="rm-filter-label">Filter Periode:</span>
          <div className="rm-period-chips">
            {(['hari', 'minggu', 'bulan', 'tahun'] as ReportPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                className={`rm-period-chip ${filterPeriod === p ? 'active' : ''}`}
                onClick={() => setFilterPeriod(p)}
              >
                {getPeriodLabel(p)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Print Only Header */}
      <div className="rm-print-header">
        <h2>KRIPIK TEMPE LAKSTARI</h2>
        <p>LAPORAN PENJUALAN TOKO • Periode: {getPeriodLabel(filterPeriod)}</p>
        <hr style={{ margin: '10px 0' }} />
      </div>

      {isLoading ? (
        <div className="rm-loading-state">
          <div className="rm-spinner"></div>
          <span>Memuat data laporan...</span>
        </div>
      ) : (
        <>
          {/* 4. Stat Metric Cards (Plain White & Clean) */}
          <div className="rm-stats-grid">
            <div className="rm-stat-card">
              <span className="rm-stat-label">Total Omset Penjualan</span>
              <div className="rm-stat-val">
                {formatRupiah(data?.total_omset || 0)}
              </div>
              <small className="rm-stat-sub">Transaksi Lunas / Selesai</small>
            </div>

            <div className="rm-stat-card">
              <span className="rm-stat-label">Total Transaksi Selesai</span>
              <div className="rm-stat-val">
                {(data?.total_transaksi_selesai || 0).toLocaleString('id-ID')} Pesanan
              </div>
              <small className="rm-stat-sub">{data?.persen_valid || 0}% Valid</small>
            </div>

            <div className="rm-stat-card">
              <span className="rm-stat-label">Total Produk Terjual</span>
              <div className="rm-stat-val">
                {(data?.total_produk_terjual || 0).toLocaleString('id-ID')} Bungkus
              </div>
              <small className="rm-stat-sub">Produk Lakstari</small>
            </div>

            <div className="rm-stat-card">
              <span className="rm-stat-label">Rata-Rata Nilai Transaksi</span>
              <div className="rm-stat-val">
                {formatRupiah(data?.rata_rata_transaksi || 0)}
              </div>
              <small className="rm-stat-sub">Rata-rata per pembeli</small>
            </div>
          </div>

          {/* 5. Chart Section */}
          <div className="rm-chart-section no-print">
            <div className="rm-chart-container">
              <SalesAreaChart refreshTrigger={refreshKey} />
            </div>
          </div>

          {/* 6. Dual Tables: Produk Terlaris & Rekap Pengiriman */}
          <div className="rm-panels-grid">
            {/* Panel 1: Produk Terlaris */}
            <div className="rm-panel-card">
              <div className="rm-panel-header">
                <h3>Laporan Produk Terlaris</h3>
              </div>

              <div className="rm-table-wrap">
                <table className="rm-plain-table">
                  <thead>
                    <tr>
                      <th>Nama Produk</th>
                      <th>Kategori</th>
                      <th style={{ textAlign: 'right' }}>Terjual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.produk_terlaris && data.produk_terlaris.length > 0 ? (
                      data.produk_terlaris.map((p, idx) => (
                        <tr key={idx}>
                          <td><strong>{p.nama_product}</strong></td>
                          <td>{p.kategori || '-'}</td>
                          <td style={{ textAlign: 'right' }}><strong>{p.total_terjual}</strong> bungkus</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>
                          Belum ada data produk terjual.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Panel 2: Rekap Status Pengiriman */}
            <div className="rm-panel-card">
              <div className="rm-panel-header">
                <h3>Rekap Status Pengiriman</h3>
              </div>

              <div className="rm-table-wrap">
                <table className="rm-plain-table">
                  <thead>
                    <tr>
                      <th>Status Pengiriman</th>
                      <th style={{ textAlign: 'right' }}>Jumlah Pesanan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.rekap_pengiriman && data.rekap_pengiriman.length > 0 ? (
                      data.rekap_pengiriman.map((rp, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className="rm-plain-tag">
                              {formatShipmentStatus(rp.status_pengiriman)}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <strong>{rp.jumlah_transaksi}</strong> Pesanan
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>
                          Belum ada data status pengiriman.
                        </td>
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

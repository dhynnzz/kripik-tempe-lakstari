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
      console.error('Gagal memuat laporan analytics:', err);
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

  // Calculate highest top product sales for progress bar percentage
  const maxSold = data?.produk_terlaris && data.produk_terlaris.length > 0
    ? Math.max(...data.produk_terlaris.map(p => p.total_terjual), 1)
    : 1;

  // Calculate total shipping transactions
  const totalShipping = data?.rekap_pengiriman
    ? data.rekap_pengiriman.reduce((acc, curr) => acc + curr.jumlah_transaksi, 0)
    : 0;

  // Helper for status label & colors
  const getShipmentMeta = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'terkirim' || s === 'selesai') {
      return { label: 'Terkirim / Selesai', color: '#16A34A', bg: '#DCFCE7' };
    }
    if (s === 'dalam_perjalanan' || s === 'dikirim') {
      return { label: 'Dalam Perjalanan', color: '#2563EB', bg: '#DBEAFE' };
    }
    if (s === 'dibatalkan') {
      return { label: 'Dibatalkan', color: '#DC2626', bg: '#FEE2E2' };
    }
    return { label: 'Menunggu Pickup', color: '#D97706', bg: '#FEF3C7' };
  };

  const getPeriodLabel = (p: ReportPeriod) => {
    switch (p) {
      case 'hari': return 'Hari Ini';
      case 'minggu': return 'Minggu Ini';
      case 'bulan': return 'Bulan Ini';
      case 'tahun': return 'Tahun Ini';
    }
  };

  return (
    <div className="report-manager-root">
      {/* 1. Header Banner & Action Bar */}
      <div className="rm-header-banner no-print">
        <div className="rm-header-text">
          <h2>Laporan Penjualan & Performa Bisnis</h2>
          <p>
            Rekapitulasi omset toko, volume penjualan, performa produk terlaris, dan distribusi status logistik pengiriman.
          </p>
        </div>

        <div className="rm-header-actions">
          {/* Print Button */}
          <button
            type="button"
            className="btn-rm-action btn-rm-print"
            onClick={handlePrint}
            title="Cetak Laporan ke PDF / Kertas"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Cetak Laporan</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            className="btn-rm-action"
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={isLoading}
            title="Segarkan data"
          >
            <svg
              className={isLoading ? 'rm-spinning' : ''}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{isLoading ? 'Memuat...' : 'Segarkan'}</span>
          </button>
        </div>
      </div>

      {/* 2. Period Filter Bar */}
      <div className="rm-filter-card no-print">
        <div className="rm-filter-left">
          <span className="rm-filter-label">Rentang Waktu Laporan:</span>
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

        <div className="rm-filter-right">
          <span className="rm-active-indicator">
            Menampilkan data untuk: <strong>{getPeriodLabel(filterPeriod)}</strong>
          </span>
        </div>
      </div>

      {/* 3. Print Only Official Header */}
      <div className="rm-print-header">
        <div className="rm-print-company">
          <h2>KRIPIK TEMPE LAKSTARI</h2>
          <p>Jl. Terusan Panglima Sudirman, Kota Batu, Jawa Timur • WhatsApp: 0812-3456-7890</p>
        </div>
        <div className="rm-print-meta">
          <h3>LAPORAN KINERJA PENJUALAN & ANALYTICS</h3>
          <p>Periode: {getPeriodLabel(filterPeriod)} • Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="rm-loading-state">
          <div className="rm-spinner"></div>
          <span>Memuat Rekapitulasi Laporan & Analytics...</span>
        </div>
      ) : (
        <>
          {/* 4. Stat Metric Cards */}
          <div className="rm-stats-grid">
            {/* Total Omset */}
            <div className="rm-stat-card omset-card">
              <div className="rm-stat-header">
                <span className="rm-stat-title">Total Omset Penjualan</span>
                <div className="rm-stat-icon gold">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
              </div>
              <div className="rm-stat-val gold-text">
                {formatRupiah(data?.total_omset || 0)}
              </div>
              <div className="rm-stat-footer">
                <span className="rm-pill-badge gold">
                  {data?.total_omset && data.total_omset > 0 ? 'Telah Dikonfirmasi' : 'Belum Ada Transaksi'}
                </span>
                <small>Lunas / Selesai</small>
              </div>
            </div>

            {/* Total Transaksi Selesai */}
            <div className="rm-stat-card">
              <div className="rm-stat-header">
                <span className="rm-stat-title">Transaksi Sukses</span>
                <div className="rm-stat-icon green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              </div>
              <div className="rm-stat-val">
                {(data?.total_transaksi_selesai || 0).toLocaleString('id-ID')}
                <span className="rm-stat-unit"> Pesanan</span>
              </div>
              <div className="rm-stat-footer">
                <span className="rm-pill-badge green">
                  {data?.persen_valid || 0}% Validitas
                </span>
                <small>Dari seluruh pesanan masuk</small>
              </div>
            </div>

            {/* Total Produk Terjual */}
            <div className="rm-stat-card">
              <div className="rm-stat-header">
                <span className="rm-stat-title">Volume Produk Terjual</span>
                <div className="rm-stat-icon blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
              </div>
              <div className="rm-stat-val">
                {(data?.total_produk_terjual || 0).toLocaleString('id-ID')}
                <span className="rm-stat-unit"> Bungkus</span>
              </div>
              <div className="rm-stat-footer">
                <span className="rm-pill-badge blue">Produk Lakstari</span>
                <small>Telah diproses / dikirim</small>
              </div>
            </div>

            {/* Rata-Rata Nilai Transaksi */}
            <div className="rm-stat-card">
              <div className="rm-stat-header">
                <span className="rm-stat-title">Rata-Rata Keranjang (AOV)</span>
                <div className="rm-stat-icon purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                  </svg>
                </div>
              </div>
              <div className="rm-stat-val">
                {formatRupiah(data?.rata_rata_transaksi || 0)}
              </div>
              <div className="rm-stat-footer">
                <span className="rm-pill-badge purple">Nilai Rata-Rata</span>
                <small>Per transaksi checkout</small>
              </div>
            </div>
          </div>

          {/* 5. Interactive Sales Area Chart (PRD Section 11) */}
          <div className="rm-chart-section no-print">
            <div className="rm-chart-container">
              <SalesAreaChart refreshTrigger={refreshKey} />
            </div>
          </div>

          {/* 6. Dual Grid: Top Selling Products & Shipment Breakdown */}
          <div className="rm-panels-grid">
            {/* PANEL KIRI: Produk Terlaris */}
            <div className="rm-panel-card">
              <div className="rm-panel-header">
                <div className="rm-panel-title-wrap">
                  <div className="rm-panel-icon gold">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div>
                    <h3>5 Produk Terlaris</h3>
                    <p>Peringkat produk berdasarkan total bungkus terjual</p>
                  </div>
                </div>
              </div>

              <div className="rm-panel-body">
                {data?.produk_terlaris && data.produk_terlaris.length > 0 ? (
                  <div className="rm-top-products-list">
                    {data.produk_terlaris.map((p, idx) => {
                      const percentage = Math.round((p.total_terjual / maxSold) * 100);
                      return (
                        <div key={idx} className="rm-product-item">
                          <div className="rm-product-rank-badge rank-${idx + 1}">
                            #{idx + 1}
                          </div>
                          <div className="rm-product-info">
                            <div className="rm-product-name-row">
                              <span className="rm-product-name">{p.nama_product}</span>
                              <span className="rm-product-sold-text">
                                <strong>{p.total_terjual}</strong> bungkus
                              </span>
                            </div>
                            <div className="rm-progress-bar-bg">
                              <div
                                className="rm-progress-bar-fill"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="rm-product-sub-row">
                              <span className="rm-category-tag">{p.kategori || 'Kripik Tempe'}</span>
                              <small className="rm-share-text">{percentage}% dari produk teratas</small>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rm-panel-empty">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                    </svg>
                    <span>Belum ada data produk terjual pada periode ini.</span>
                  </div>
                )}
              </div>
            </div>

            {/* PANEL KANAN: Rekapitulasi Status Logistik & Pengiriman */}
            <div className="rm-panel-card">
              <div className="rm-panel-header">
                <div className="rm-panel-title-wrap">
                  <div className="rm-panel-icon blue">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  </div>
                  <div>
                    <h3>Distribusi Status Pengiriman</h3>
                    <p>Rincian status penyerahan pesanan ke ekspedisi kurir</p>
                  </div>
                </div>
              </div>

              <div className="rm-panel-body">
                {data?.rekap_pengiriman && data.rekap_pengiriman.length > 0 ? (
                  <div className="rm-shipping-breakdown-list">
                    {data.rekap_pengiriman.map((rp, idx) => {
                      const meta = getShipmentMeta(rp.status_pengiriman);
                      const percent = totalShipping > 0
                        ? Math.round((rp.jumlah_transaksi / totalShipping) * 100)
                        : 0;

                      return (
                        <div key={idx} className="rm-shipping-item">
                          <div className="rm-shipping-top">
                            <div className="rm-shipping-status-wrap">
                              <span
                                className="rm-status-badge"
                                style={{ backgroundColor: meta.bg, color: meta.color }}
                              >
                                {meta.label}
                              </span>
                            </div>
                            <div className="rm-shipping-count-wrap">
                              <strong>{rp.jumlah_transaksi}</strong>
                              <span>Pesanan ({percent}%)</span>
                            </div>
                          </div>
                          <div className="rm-progress-bar-bg">
                            <div
                              className="rm-progress-bar-fill"
                              style={{ width: `${percent}%`, backgroundColor: meta.color }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rm-panel-empty">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                    <span>Belum ada data status pengiriman pada periode ini.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportManager;

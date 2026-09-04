import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { normalizeProductImage } from '../../../context/ProductContext';
import './DashboardHome.css';

/* ── Summary Card Icons (Lucide-style SVG, Clean & Monochromatic) ── */
const IcPackage = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

const IcUsers = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IcShoppingBag = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const IcClock = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IcBanknote = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="12" x="2" y="6" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <line x1="6" y1="12" x2="6.01" y2="12" />
    <line x1="18" y1="12" x2="18.01" y2="12" />
  </svg>
);

/* ── SVG Icons ── */
const SearchIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const SortIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>;
const FilterIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;

/* ════════════════════════════════════════
   A. RINGKASAN UTAMA (6 kartu)
════════════════════════════════════════ */
// We will generate summaryCards dynamically from state

/* ════════════════════════════════════════
   B. RINGKASAN STATUS PESANAN (Skema Warna Teratur)
════════════════════════════════════════ */
const orderStatusColors: Record<string, string> = {
  'Menunggu Pembayaran': '#F59E0B',
  'Diproses': '#232B45',
  'Dikemas': '#232B45',
  'Siap Dikirim': '#2563EB',
  'Dikirim': '#2563EB',
  'Selesai': '#16A34A',
  'Dibatalkan': '#64748B',
};


const payBadge: Record<string,string> = {
  Paid:'b-paid', Pending:'b-pending', Failed:'b-failed',
};

const txBadge: Record<string,string> = {
  'Menunggu Pembayaran':'b-pending', 'Diproses':'b-process', 'Dikemas':'b-packed',
  'Siap Dikirim':'b-ready', 'Dikirim':'b-shipped', 'Selesai':'b-done', 'Dibatalkan':'b-cancel',
};
import { apiService } from '../../../services/api';
import { SalesAreaChart } from './SalesAreaChart';
import { printReceipt } from '../../../utils/printReceipt';

export default function DashboardHome() {
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'name-asc'>('date-desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeMenuInv, setActiveMenuInv] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const fetchStats = async () => {
    setIsRefreshing(true);
    setRefreshCounter((prev) => prev + 1);
    try {
      const data = await apiService.getDashboardStats();
      if (data) setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-sync
    const handleFocus = () => fetchStats();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchStats();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  // Filter & Sort Pipeline
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const recentOrders = stats?.recentOrders || [];
  const stockLow = stats?.stokMenipis || [];
  const stockEmpty = stats?.stokHabis || [];
  const totalOrders = stats?.summary?.totalPesanan || 0;

  const filtered = recentOrders
    .filter((o: any) => {
      const customerName = o.pelanggan?.nama_pelanggan || '';
      const matchSearch = !search || customerName.toLowerCase().includes(search.toLowerCase()) || o.nomor_invoice.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || o.status_pembayaran === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a: any, b: any) => {
      if (sortKey === 'date-desc')   return new Date(b.tanggal_transaksi).getTime() - new Date(a.tanggal_transaksi).getTime();
      if (sortKey === 'date-asc')    return new Date(a.tanggal_transaksi).getTime() - new Date(b.tanggal_transaksi).getTime();
      if (sortKey === 'amount-desc') return b.total_pembayaran - a.total_pembayaran;
      if (sortKey === 'amount-asc')  return a.total_pembayaran - b.total_pembayaran;
      if (sortKey === 'name-asc')    return (a.pelanggan?.nama_pelanggan || '').localeCompare(b.pelanggan?.nama_pelanggan || '');
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedOrders = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getPageNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, sortKey]);

  const summaryCards = [
    { 
      label: 'Total Produk',      
      value: stats?.summary?.totalProduk || '0',           
      Icon: IcPackage,       
      cls: 'card-prod',
      iconCls: 'ic-neutral',
      badge: `${stats?.summary?.totalProduk || 0} Aktif`, 
      badgeType: 'badge-neutral',
      desc: 'Katalog terdaftar' 
    },
    { 
      label: 'Total Pelanggan',   
      value: stats?.summary?.totalPelanggan || '0',        
      Icon: IcUsers,     
      cls: 'card-cust',
      iconCls: 'ic-neutral',
      badge: `+${stats?.summary?.totalPelanggan || 0} User`, 
      badgeType: 'badge-neutral',
      desc: 'Pelanggan aktif' 
    },
    { 
      label: 'Total Pesanan',     
      value: stats?.summary?.totalPesanan || '0',          
      Icon: IcShoppingBag, 
      cls: 'card-orders',
      iconCls: 'ic-neutral',
      badge: `${stats?.summary?.totalPesanan || 0} Invoice`, 
      badgeType: 'badge-neutral',
      desc: 'Semua transaksi' 
    },
    { 
      label: 'Pesanan Hari Ini',  
      value: stats?.summary?.pesananHariIni || '0',        
      Icon: IcClock,       
      cls: 'card-today',
      iconCls: 'ic-neutral',
      badge: `${stats?.summary?.pesananHariIni || 0} Baru`, 
      badgeType: 'badge-neutral',
      desc: 'Perlu diproses' 
    },
    { 
      label: 'Total Pendapatan',  
      value: formatRupiah(stats?.summary?.pendapatan || 0),
      Icon: IcBanknote,    
      cls: 'card-rev',
      iconCls: 'ic-neutral',
      badge: 'Live Sync', 
      badgeType: 'badge-neutral',
      desc: 'Penjualan lunas' 
    },
  ];

  const orderStatuses = stats ? Object.entries(stats.orderStatuses).map(([name, count]) => ({
    name, count: count as number, color: orderStatusColors[name] || '#64748B'
  })) : [];

  // Top 5 Produk & Varian Terlaris
  const topProducts: any[] = stats?.topProducts || [];
  const maxSold = topProducts.length > 0
    ? Math.max(...topProducts.map((p: any) => Number(p.total_terjual) || 0), 1)
    : 1;
  const totalUnitsSold = topProducts.reduce((sum: number, p: any) => sum + (Number(p.total_terjual) || 0), 0);

  return (
    <div className="dh-root" onClick={() => { setActiveMenuInv(null); setShowSortMenu(false); setShowFilterMenu(false); }}>

      {/* ── Modern Page Header ── */}
      <div className="dh-page-header">
        <div className="dh-header-left">
          <h1>Ringkasan Penjualan & Toko</h1>
          <p>Pantau performa bisnis, pergerakan stok, dan pesanan pelanggan secara langsung.</p>
        </div>

        <div className="dh-header-right">
          <button 
            className={`dh-refresh-btn ${isRefreshing ? 'is-loading' : ''}`} 
            onClick={() => { fetchStats(); showNotification('Data dashboard berhasil diperbarui!'); }}
            disabled={isRefreshing}
            title="Segarkan Data"
          >
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }}
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            <span>{isRefreshing ? 'Memuat...' : 'Segarkan'}</span>
          </button>
        </div>
      </div>

      {/* ══ A. RINGKASAN UTAMA — 5 Modern Cards ══ */}
      <div className="dh-summary-grid">
        {summaryCards.map((c, i) => (
          <div className={`dh-sum-card ${c.cls}`} key={i}>
            <div className="dh-sum-top">
              <span className="dh-sum-label">{c.label}</span>
              <div className={`dh-sum-icon ${c.iconCls}`}><c.Icon /></div>
            </div>
            
            <div className={`dh-sum-value ${c.cls === 'card-rev' ? 'is-currency' : ''}`}>{c.value}</div>
            
            <div className="dh-sum-footer">
              <span className={`dh-card-pill ${c.badgeType}`}>
                {c.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ══ B. GRAFIK TREN PENJUALAN TOKO (Smooth Area / Line Chart) ══ */}
      <SalesAreaChart refreshTrigger={refreshCounter} />

      {/* ══ C & D: Status Pesanan (Bar Chart) + Ringkasan Pembayaran (Pie/Donut Chart) ══ */}
      <div className="dh-mid-grid">

        {/* B: Ringkasan Status Pesanan (Bento Bar Chart) */}
        <div className="dh-panel">
          <div className="dh-panel-head">
            <p className="dh-panel-title">Ringkasan Status Pesanan</p>
            <span className="dh-panel-count">Total {totalOrders} pesanan</span>
          </div>
          <div className="dh-bento-barchart-container">
            <div className="dh-bento-bars-wrap">
              {orderStatuses.map((item: any, i: number) => {
                const maxVal = Math.max(...orderStatuses.map((x: any) => x.count), 1);
                const heightPct = item.count === 0 ? 4 : Math.max(12, Math.round((item.count / maxVal) * 92));
                const colors = ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#06B6D4', '#16A34A', '#EF4444'];
                const itemColor = colors[i % colors.length];

                return (
                  <div key={i} className="dh-bento-bar-col">
                    <AnimatePresence>
                      {hoveredBar === i && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="dh-bento-tooltip"
                        >
                          {item.count} pesanan
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="dh-bento-track">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                          delay: i * 0.05,
                        }}
                        onHoverStart={() => setHoveredBar(i)}
                        onHoverEnd={() => setHoveredBar(null)}
                        className="dh-bento-fill"
                        style={{ backgroundColor: itemColor }}
                        whileHover={{ scaleY: 1.05, scaleX: 1.05 }}
                        whileTap={{ scaleY: 0.95 }}
                      >
                        <span className="dh-bento-val">{item.count}</span>
                      </motion.div>
                    </div>

                    <span className="dh-bento-label" title={item.name}>
                      {item.name === 'Menunggu Pembayaran' ? 'Menunggu' : item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* C: Produk & Varian Terlaris (Top 5 Best Selling Products) */}
        <div className="dh-panel">
          <div className="dh-panel-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p className="dh-panel-title">Produk & Varian Terlaris</p>
              <span className="dh-badge-top-selling">Top 5</span>
            </div>
            <span className="dh-panel-count">
              {totalUnitsSold > 0 ? `${totalUnitsSold} pcs terjual (Lunas)` : 'Berdasarkan transaksi lunas'}
            </span>
          </div>

          <div className="dh-top-products-container">
            {topProducts.length === 0 ? (
              <div className="dh-top-products-empty">
                <div className="dh-top-empty-icon">🏆</div>
                <p className="dh-top-empty-text">Belum ada transaksi lunas untuk menampilkan produk terlaris.</p>
              </div>
            ) : (
              <div className="dh-top-products-list">
                {topProducts.map((item: any, idx: number) => {
                  const soldCount = Number(item.total_terjual) || 0;
                  const pct = Math.round((soldCount / maxSold) * 100);
                  const omset = Number(item.total_omset) || (soldCount * Number(item.harga_product || 0));

                  const rankStyles = [
                    { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' }, // Gold
                    { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' }, // Silver
                    { bg: '#FFEDD5', color: '#C2410C', border: '#FED7AA' }, // Bronze
                    { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' },
                    { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' },
                  ];
                  const rStyle = rankStyles[idx] || rankStyles[3];

                  return (
                    <motion.div
                      key={item.id_product || idx}
                      className="dh-top-product-item"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
                    >
                      <div className="dh-top-row">
                        <div className="dh-top-info-wrap">
                          <div
                            className="dh-rank-badge"
                            style={{
                              backgroundColor: rStyle.bg,
                              color: rStyle.color,
                              borderColor: rStyle.border
                            }}
                          >
                            #{idx + 1}
                          </div>

                          <img
                            src={normalizeProductImage(item.foto_product || item.varian_rasa || item.nama_product)}
                            alt={item.nama_product}
                            className="dh-top-product-thumb"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/products/flavor-original.png';
                            }}
                          />

                          <div className="dh-top-meta">
                            <span className="dh-top-name" title={item.nama_product}>
                              {item.nama_product}
                            </span>
                            <div className="dh-top-tags">
                              {item.varian_rasa && (
                                <span className="dh-top-flavor-tag">{item.varian_rasa}</span>
                              )}
                              {item.kategori && (
                                <span className="dh-top-cat-tag">{item.kategori}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="dh-top-numbers">
                          <span className="dh-top-sold">
                            <strong>{soldCount}</strong> pcs
                          </span>
                          <span className="dh-top-revenue">
                            {formatRupiah(omset)}
                          </span>
                        </div>
                      </div>

                      <div className="dh-top-bar-track">
                        <motion.div
                          className={`dh-top-bar-fill rank-${idx + 1}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.12 + idx * 0.06, type: 'spring', stiffness: 180, damping: 22 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ D: INFORMASI STOK (NEW DESIGN) ══ */}
      <div className="dh-stock-container">
        
        {/* Kolom 1: Stok Menipis */}
        <div className="dh-stock-column">
          <div className="dh-stock-header">
            <h3 className="dh-stock-title">Stok Menipis</h3>
            <span className="dh-stock-badge count-low">{stockLow.length}</span>
          </div>

          <div className="dh-stock-list-new">
            {stockLow.length === 0 ? (
              <div className="dh-stock-empty-state">✓ Tidak ada produk yang stoknya menipis</div>
            ) : (
              stockLow.map((s: any, i: number) => {
                const diff = s.stok_product - s.stok_minimum;
                return (
                  <div className="dh-stock-card" key={`low-${i}`}>
                    <img
                      src={normalizeProductImage(s.foto_product || s.varian_rasa || s.nama_product)}
                      alt="Produk"
                      className="dh-stock-img"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/products/flavor-original.png';
                      }}
                    />
                    <div className="dh-stock-detail">
                      <div className="dh-stock-name">{s.nama_product}</div>
                      <div className="dh-stock-weight">{s.berat_product} gram</div>
                      <div className="dh-stock-stats">
                        <span>Stok: <strong>{s.stok_product} pcs</strong></span>
                        <span>Min: <strong>{s.stok_minimum} pcs</strong></span>
                        <span style={{ color: '#D97706' }}>Selisih: <strong>{diff} pcs</strong></span>
                      </div>
                    </div>
                    <div className="dh-stock-action">
                      <div className="dh-badge-low">Menipis</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Kolom 2: Stok Habis */}
        <div className="dh-stock-column">
          <div className="dh-stock-header">
            <h3 className="dh-stock-title">Stok Habis</h3>
            <span className="dh-stock-badge count-empty">{stockEmpty.length}</span>
          </div>

          <div className="dh-stock-list-new">
            {stockEmpty.length === 0 ? (
              <div className="dh-stock-empty-state">✓ Tidak ada produk yang stoknya habis</div>
            ) : (
              stockEmpty.map((s: any, i: number) => {
                return (
                  <div className="dh-stock-card border-red" key={`empty-${i}`}>
                    <img
                      src={normalizeProductImage(s.foto_product || s.varian_rasa || s.nama_product)}
                      alt="Produk"
                      className="dh-stock-img grayscale"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/products/flavor-original.png';
                      }}
                    />
                    <div className="dh-stock-detail">
                      <div className="dh-stock-name">{s.nama_product}</div>
                      <div className="dh-stock-weight">{s.berat_product} gram</div>
                      <div className="dh-stock-stats">
                        <span style={{ color: '#DC2626' }}>Stok: <strong>0 pcs</strong></span>
                        <span>Min: <strong>{s.stok_minimum} pcs</strong></span>
                      </div>
                    </div>
                    <div className="dh-stock-action">
                      <div className="dh-badge-empty">Habis</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ══ PESANAN TERBARU ══ */}
      <div className="dh-panel">
        <div className="dh-panel-head">
          <div>
            <p className="dh-panel-title">Pesanan Terbaru</p>
            <div style={{ fontSize:11, color:'#64748B', marginTop:2, fontWeight: 500 }}>Transaksi terbaru dari toko Lakstari</div>
          </div>
          <div className="dh-table-tools-wrap">
            <div className="dh-search-box">
              <span style={{ color: '#94A3B8' }}><SearchIcon /></span>
              <input
                type="text"
                placeholder="Cari invoice atau pelanggan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="dh-toolbar-right" style={{ position: 'relative' }}>

              {/* Sort Button & Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  className="dh-tool-btn"
                  onClick={(e) => { e.stopPropagation(); setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
                  style={{ background: sortKey !== 'date-desc' ? '#0F172A' : '#ffffff', color: sortKey !== 'date-desc' ? '#ffffff' : '#334155' }}
                >
                  <SortIcon /> Urutkan
                </button>

                {showSortMenu && (
                  <div className="dh-dropdown-menu">
                    <div className="dh-dropdown-header">Urutkan Berdasarkan</div>
                    <button className={sortKey === 'date-desc' ? 'active' : ''} onClick={() => { setSortKey('date-desc'); setShowSortMenu(false); }}>Tanggal: Terbaru</button>
                    <button className={sortKey === 'date-asc' ? 'active' : ''} onClick={() => { setSortKey('date-asc'); setShowSortMenu(false); }}>Tanggal: Terlama</button>
                    <button className={sortKey === 'amount-desc' ? 'active' : ''} onClick={() => { setSortKey('amount-desc'); setShowSortMenu(false); }}>Total: Tertinggi</button>
                    <button className={sortKey === 'amount-asc' ? 'active' : ''} onClick={() => { setSortKey('amount-asc'); setShowSortMenu(false); }}>Total: Terendah</button>
                    <button className={sortKey === 'name-asc' ? 'active' : ''} onClick={() => { setSortKey('name-asc'); setShowSortMenu(false); }}>Pelanggan: A - Z</button>
                  </div>
                )}
              </div>

              {/* Filter Button & Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  className="dh-tool-btn"
                  onClick={(e) => { e.stopPropagation(); setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
                  style={{ background: filterStatus !== 'all' ? '#0F172A' : '#ffffff', color: filterStatus !== 'all' ? '#ffffff' : '#334155' }}
                >
                  <FilterIcon /> Filter {filterStatus !== 'all' ? `(${filterStatus})` : ''}
                </button>

                {showFilterMenu && (
                  <div className="dh-dropdown-menu">
                    <div className="dh-dropdown-header">Filter Pembayaran</div>
                    <button className={filterStatus === 'all' ? 'active' : ''} onClick={() => { setFilterStatus('all'); setShowFilterMenu(false); }}>Semua Status</button>
                    <button className={filterStatus === 'paid' ? 'active' : ''} onClick={() => { setFilterStatus('paid'); setShowFilterMenu(false); }}>Paid (Lunas)</button>
                    <button className={filterStatus === 'pending' ? 'active' : ''} onClick={() => { setFilterStatus('pending'); setShowFilterMenu(false); }}>Pending (Menunggu)</button>
                    <button className={filterStatus === 'failed' ? 'active' : ''} onClick={() => { setFilterStatus('failed'); setShowFilterMenu(false); }}>Failed (Gagal)</button>
                    <button className={filterStatus === 'expired' ? 'active' : ''} onClick={() => { setFilterStatus('expired'); setShowFilterMenu(false); }}>Expired (Kadaluarsa)</button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        <div className="dh-table-responsive-wrapper">
          <table className="dh-tbl">
              <thead>
                <tr>
                  <th>Nomor Invoice</th>
                  <th>Nama Pelanggan</th>
                  <th>Total Pembayaran</th>
                  <th>Status Pembayaran</th>
                  <th>Status Transaksi</th>
                  <th>Tanggal Transaksi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: '#64748B' }}>
                      Tidak ada data pesanan yang sesuai dengan filter / pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((o: any, i: number) => (
                    <tr key={o.nomor_invoice || i}>
                      <td><span className="dh-td-inv">{o.nomor_invoice}</span></td>
                      <td><span className="dh-td-customer">{o.pelanggan?.nama_pelanggan || '-'}</span></td>
                      <td><span className="dh-td-amount">{formatRupiah(o.total_pembayaran)}</span></td>
                      <td>
                        <span className={`dh-badge ${payBadge[o.status_pembayaran] ?? 'b-pending'}`}>
                          {o.status_pembayaran}
                        </span>
                      </td>
                      <td>
                        <span className={`dh-badge ${txBadge[o.status_transaksi] ?? 'b-pending'}`}>
                          {o.status_transaksi}
                        </span>
                      </td>
                      <td><span className="dh-td-date">{new Date(o.tanggal_transaksi).toLocaleDateString('id-ID')}</span></td>
                      <td style={{ position: 'relative' }}>
                        <button
                          className="dh-row-more-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuInv(activeMenuInv === o.nomor_invoice ? null : o.nomor_invoice);
                          }}
                        >
                          ···
                        </button>

                        {activeMenuInv === o.nomor_invoice && (
                          <div className="dh-row-menu" onClick={e => e.stopPropagation()}>
                            <button onClick={() => { setSelectedOrder(o); setActiveMenuInv(null); }}>
                              👁️ Lihat Detail
                            </button>
                            <button onClick={() => { 
                              printReceipt(o); 
                              showNotification(`Mencetak Struk Invoice ${o.nomor_invoice}...`); 
                              setActiveMenuInv(null); 
                            }}>
                              🖨️ Cetak Struk
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Order Cards (<= 768px: 100% full-width, zero horizontal scroll) ── */}
          <div className="dh-mobile-orders-list">
            {paginatedOrders.length === 0 ? (
              <div className="dh-mob-order-empty">
                Tidak ada data pesanan yang sesuai dengan filter / pencarian.
              </div>
            ) : (
              paginatedOrders.map((o: any, i: number) => (
                <div key={o.nomor_invoice || i} className="dh-mob-order-card">
                  {/* Header: Invoice & Tanggal */}
                  <div className="dh-mob-order-header">
                    <div className="dh-mob-inv-wrap">
                      <span className="dh-mob-inv-prefix">#</span>
                      <span className="dh-mob-inv-num">{o.nomor_invoice}</span>
                    </div>
                    <span className="dh-mob-order-date">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {new Date(o.tanggal_transaksi).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Body: Pelanggan & Total Nominal */}
                  <div className="dh-mob-order-body">
                    <div className="dh-mob-cust-row">
                      <div className="dh-mob-cust-info">
                        <div className="dh-mob-cust-icon">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <span className="dh-mob-cust-name">{o.pelanggan?.nama_pelanggan || 'Pelanggan'}</span>
                      </div>
                      <span className="dh-mob-order-total">{formatRupiah(o.total_pembayaran)}</span>
                    </div>

                    {/* Status Badges */}
                    <div className="dh-mob-badges-row">
                      <div className="dh-mob-badge-item">
                        <span className="dh-mob-badge-label">Bayar:</span>
                        <span className={`dh-badge ${payBadge[o.status_pembayaran] ?? 'b-pending'}`}>
                          {o.status_pembayaran}
                        </span>
                      </div>
                      <div className="dh-mob-badge-item">
                        <span className="dh-mob-badge-label">Transaksi:</span>
                        <span className={`dh-badge ${txBadge[o.status_transaksi] ?? 'b-pending'}`}>
                          {o.status_transaksi}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Quick Action Buttons */}
                  <div className="dh-mob-order-footer">
                    <button
                      type="button"
                      className="dh-mob-action-btn detail"
                      onClick={() => setSelectedOrder(o)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <span>Detail</span>
                    </button>
                    <button
                      type="button"
                      className="dh-mob-action-btn print"
                      onClick={() => {
                        printReceipt(o);
                        showNotification(`Mencetak Struk Invoice ${o.nomor_invoice}...`);
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                      </svg>
                      <span>Cetak Struk</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Table Pagination Bar ── */}
          <div className="dh-table-pagination">
            <div className="dh-pagination-info">
              Menampilkan <strong>{filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong>–
              <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong> dari <strong>{filtered.length}</strong> pesanan terbaru
            </div>
            
            {totalPages > 1 && (
              <div className="dh-pagination-controls">
                <div className="dh-page-numbers">
                  {getPageNumbers(currentPage, totalPages).map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span key={`dots-${idx}`} className="dh-page-ellipsis">
                          ···
                        </span>
                      );
                    }
                    const pageNum = Number(item);
                    return (
                      <button
                        key={pageNum}
                        className={`dh-page-number-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <div className="dh-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="dh-modal-card" onClick={e => e.stopPropagation()}>
            <div className="dh-modal-header">
              <div>
                <h3>Rincian Transaksi</h3>
                <p>{selectedOrder.nomor_invoice}</p>
              </div>
              <button className="dh-modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="dh-modal-body">
              <div className="dh-modal-row">
                <span>Nama Pelanggan</span>
                <strong>{selectedOrder.pelanggan?.nama_pelanggan || selectedOrder.alamat?.nama_penerima || '-'}</strong>
              </div>
              <div className="dh-modal-row">
                <span>No. HP</span>
                <span>{selectedOrder.pelanggan?.no_hp || selectedOrder.alamat?.no_hp_penerima || '-'}</span>
              </div>
              <div className="dh-modal-row">
                <span>Tanggal Transaksi</span>
                <span>{new Date(selectedOrder.tanggal_transaksi).toLocaleString('id-ID')}</span>
              </div>
              <div className="dh-modal-row">
                <span>Status Pembayaran</span>
                <span className={`dh-badge ${payBadge[selectedOrder.status_pembayaran] || 'b-pending'}`}>
                  {selectedOrder.status_pembayaran}
                </span>
              </div>
              <div className="dh-modal-row">
                <span>Status Transaksi</span>
                <span className={`dh-badge ${txBadge[selectedOrder.status_transaksi] || 'b-pending'}`}>
                  {selectedOrder.status_transaksi}
                </span>
              </div>
              {selectedOrder.details && selectedOrder.details.length > 0 && (
                <div style={{ margin: '12px 0 6px', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>Rincian Barang:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                    {selectedOrder.details.map((item: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', background: '#F8FAFC', padding: '6px 10px', borderRadius: '6px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{item.nama_product || item.product?.nama_product || 'Kripik Tempe'}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{item.jumlah || item.qty || 1} x {formatRupiah(item.harga_product || item.harga_satuan || 0)}</div>
                        </div>
                        <strong style={{ color: '#0F172A' }}>{formatRupiah(item.subtotal || 0)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedOrder.alamat?.alamat_lengkap && (
                <div style={{ margin: '8px 0', borderTop: '1px solid #E2E8F0', paddingTop: '8px', fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                  <strong style={{ color: '#334155' }}>Alamat Pengiriman:</strong><br />
                  {selectedOrder.alamat.alamat_lengkap}, {selectedOrder.alamat.kecamatan ? `${selectedOrder.alamat.kecamatan}, ` : ''}{selectedOrder.alamat.kota || ''}
                  {selectedOrder.pengiriman?.kurir && (
                    <div style={{ marginTop: '3px', fontSize: '11px', color: '#2563EB', fontWeight: 600 }}>
                      Kurir: {selectedOrder.pengiriman.kurir.toUpperCase()} {selectedOrder.pengiriman.nomor_resi ? `(${selectedOrder.pengiriman.nomor_resi})` : ''}
                    </div>
                  )}
                </div>
              )}
              <div className="dh-modal-row highlight" style={{ marginTop: '10px' }}>
                <span>Total Pembayaran</span>
                <strong style={{ fontSize: 16, color: '#232B45' }}>{formatRupiah(selectedOrder.total_pembayaran)}</strong>
              </div>
            </div>
            <div className="dh-modal-footer">
              <button className="dh-tool-btn" style={{ background: '#F1F5F9' }} onClick={() => {
                printReceipt(selectedOrder);
                showNotification(`Mencetak Struk Invoice ${selectedOrder.nomor_invoice}...`);
              }}>
                🖨️ Cetak Struk
              </button>
              <button className="dh-action-btn primary" style={{ padding: '8px 20px' }} onClick={() => setSelectedOrder(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toastMsg && (
        <div className="dh-toast">
          {toastMsg}
        </div>
      )}

    </div>
  );
}

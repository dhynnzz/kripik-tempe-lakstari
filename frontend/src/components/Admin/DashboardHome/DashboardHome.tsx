import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

/* ════════════════════════════════════════
   C. RINGKASAN PEMBAYARAN
════════════════════════════════════════ */
const payStatusColors: Record<string, string> = {
  'Paid': 'py-paid',
  'Pending': 'py-pending',
  'Failed': 'py-failed',
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
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

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

  const payStatuses = stats ? Object.entries(stats.payStatuses).map(([name, count]) => ({
    name, count: count as number, badgeCls: payStatusColors[name] || 'py-pending'
  })) : [];

  const getPieCoords = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const springConfig = { type: "spring" as const, stiffness: 300, damping: 20 };
  const payTotal = payStatuses.reduce((a: number, b: any) => a + b.count, 0);
  
  let cumulativePercent = 0;
  const pieData = payStatuses.map((p: any) => {
    const pct = payTotal > 0 ? (p.count / payTotal) * 100 : 0;
    return {
      label: p.name,
      count: p.count,
      value: Math.round(pct),
      rawPct: pct / 100,
      color: p.name === 'Paid' ? '#10B981' : p.name === 'Pending' ? '#F59E0B' : '#EF4444'
    };
  });

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

        {/* C: Ringkasan Pembayaran (Bento Donut / Pie Chart) */}
        <div className="dh-panel">
          <div className="dh-panel-head">
            <p className="dh-panel-title">Ringkasan Pembayaran</p>
            <span className="dh-panel-count">Total {payTotal} transaksi</span>
          </div>

          <div className="dh-bento-donut-container">
            <div className="dh-donut-visual-wrap">
              <div className="dh-donut-svg-box">
                <motion.svg
                  viewBox="-1.2 -1.2 2.4 2.4"
                  className="dh-donut-svg"
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: -90, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    delay: 0.1,
                  }}
                >
                  {pieData.map((slice: any) => {
                    const startPercent = cumulativePercent;
                    const endPercent = cumulativePercent + (slice.rawPct || 0);
                    cumulativePercent = endPercent;

                    if (slice.rawPct === 0) return null;

                    const [startX, startY] = getPieCoords(startPercent);
                    const [endX, endY] = getPieCoords(endPercent);
                    const largeArcFlag = slice.rawPct > 0.5 ? 1 : 0;
                    const pathData = [
                      `M ${startX} ${startY}`,
                      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                      `L 0 0`,
                    ].join(" ");
                    const isHovered = hoveredSlice === slice.label;
                    const isDimmed = hoveredSlice !== null && !isHovered;

                    return (
                      <motion.path
                        key={slice.label}
                        d={pathData}
                        fill={slice.color}
                        className="dh-donut-slice"
                        stroke="#ffffff"
                        strokeWidth="0.03"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={{
                          translateX: isHovered ? (startX + endX) * 0.08 : 0,
                          translateY: isHovered ? (startY + endY) * 0.08 : 0,
                          scale: isHovered ? 1.05 : 1,
                          opacity: isDimmed ? 0.35 : 1,
                        }}
                        transition={springConfig}
                        onMouseEnter={() => setHoveredSlice(slice.label)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      />
                    );
                  })}
                  <motion.circle
                    cx="0"
                    cy="0"
                    r="0.58"
                    className="dh-donut-center-circle"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, ...springConfig }}
                  />
                </motion.svg>

                {/* Center Percentage / Total Text */}
                <div className="dh-donut-center-text">
                  <AnimatePresence mode="popLayout">
                    {hoveredSlice ? (
                      <motion.div
                        key="hover-content"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="dh-donut-center-val"
                      >
                        <span className="dh-donut-pct">
                          {pieData.find((d: any) => d.label === hoveredSlice)?.value}%
                        </span>
                        <span className="dh-donut-sub">
                          {hoveredSlice}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default-content"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="dh-donut-center-val"
                      >
                        <span className="dh-donut-pct">
                          {payTotal}
                        </span>
                        <span className="dh-donut-sub">
                          TOTAL
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Legend List */}
              <div className="dh-donut-legend">
                {pieData.map((item: any) => (
                  <motion.div
                    key={item.label}
                    onMouseEnter={() => setHoveredSlice(item.label)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    animate={{
                      opacity: hoveredSlice && hoveredSlice !== item.label ? 0.4 : 1,
                      scale: hoveredSlice === item.label ? 1.03 : 1,
                    }}
                    className="dh-legend-item"
                  >
                    <div className="dh-legend-left">
                      <div className="dh-legend-dot" style={{ backgroundColor: item.color }} />
                      <span className="dh-legend-name">{item.label}</span>
                    </div>
                    <div className="dh-legend-right">
                      <span className="dh-legend-count">{item.count}</span>
                      <span className="dh-legend-pct">({item.value}%)</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
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
                    <img src={s.foto_product || 'https://via.placeholder.com/60'} alt="Produk" className="dh-stock-img" />
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
                    <img src={s.foto_product || 'https://via.placeholder.com/60'} alt="Produk" className="dh-stock-img grayscale" />
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
          <div style={{ display:'flex', gap:8, alignItems:'center', position: 'relative' }}>
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

        <div style={{ overflowX:'auto' }}>
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
                {filtered.map((o: any, i: number) => (
                  <tr key={i}>
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
                          <button onClick={() => { showNotification(`Mencetak Struk Invoice ${o.nomor_invoice}...`); setActiveMenuInv(null); }}>
                            🖨️ Cetak Struk
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                <strong>{selectedOrder.pelanggan?.nama_pelanggan || '-'}</strong>
              </div>
              <div className="dh-modal-row">
                <span>Tanggal Transaksi</span>
                <span>{new Date(selectedOrder.tanggal_transaksi).toLocaleString('id-ID')}</span>
              </div>
              <div className="dh-modal-row">
                <span>Status Pembayaran</span>
                <span className={`dh-badge ${payBadge[selectedOrder.status_pembayaran]}`}>
                  {selectedOrder.status_pembayaran}
                </span>
              </div>
              <div className="dh-modal-row">
                <span>Status Transaksi</span>
                <span className={`dh-badge ${txBadge[selectedOrder.status_transaksi]}`}>
                  {selectedOrder.status_transaksi}
                </span>
              </div>
              <div className="dh-modal-row highlight">
                <span>Total Pembayaran</span>
                <strong style={{ fontSize: 16, color: '#232B45' }}>{formatRupiah(selectedOrder.total_pembayaran)}</strong>
              </div>
            </div>
            <div className="dh-modal-footer">
              <button className="dh-tool-btn" style={{ background: '#F1F5F9' }} onClick={() => showNotification(`Mencetak Struk ${selectedOrder.inv}...`)}>
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

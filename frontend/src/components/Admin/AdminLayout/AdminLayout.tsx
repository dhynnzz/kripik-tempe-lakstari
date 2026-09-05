import React, { useState, useEffect, lazy, Suspense } from 'react';
import Swal from 'sweetalert2';
import './AdminLayout.css';
import { Lakstari21stSidebar } from './sidebar-component';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { apiService } from '../../../services/api';

// Lazy loaded Admin modules for optimal memory usage & instant load on low-end devices
const DashboardHome = lazy(() => import('../DashboardHome/DashboardHome'));
const ProductManager = lazy(() => import('../ProductManager/ProductManager'));
const CategoryManager = lazy(() => import('../CategoryManager/CategoryManager'));
const OrderManager = lazy(() => import('../OrderManager/OrderManager'));
const ShipmentManager = lazy(() => import('../ShipmentManager/ShipmentManager'));
const CustomerManager = lazy(() => import('../CustomerManager/CustomerManager'));
const ReportManager = lazy(() => import('../ReportManager/ReportManager'));
const SettingsManager = lazy(() => import('../SettingsManager/SettingsManager'));
const AdminLogin = lazy(() => import('../AdminLogin/AdminLogin'));

interface AdminLayoutProps {
  onSwitchToUser?: () => void;
}

const AdminTabSkeleton = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '12px',
    color: '#64748B'
  }}>
    <div style={{
      width: '32px',
      height: '32px',
      border: '3px solid #CBD5E1',
      borderTopColor: '#FAAC30',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite'
    }} />
    <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>
      Memuat modul...
    </span>
  </div>
);

/* Lucide-style PanelLeftOpen icon (inline) */
function PanelLeftOpenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="m14 9 3 3-3 3" />
    </svg>
  );
}

const tabLabels: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Produk",
  categories: "Kategori",
  orders: "Pesanan",
  shipments: "Pengiriman",
  customers: "Pelanggan",
  reports: "Laporan",
  settings: "Pengaturan",
};

const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!sessionStorage.getItem('admin_token');
  });

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'categories' | 'orders' | 'shipments' | 'customers' | 'reports' | 'settings'
  >('dashboard');

  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 1024;
    }
    return true;
  });

  // Verifikasi keabsahan sesi admin ke server saat membuka portal admin
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    apiService.checkAdminAuth().then((isValid) => {
      setIsAuthenticated(isValid);
    });
  }, []);

  // Otomatis sesuaikan sidebar saat ukuran layar berubah (Rotasi HP/iPad/Desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Keluar dari Portal?',
      text: 'Apakah Anda yakin ingin keluar dari Portal Admin?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
      await apiService.logoutAdmin();
      setIsAuthenticated(false);
    }
  };

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab as any);
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<AdminTabSkeleton />}>
        <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />
      </Suspense>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: isDark ? '#090D16' : '#F1F5F9',
      }}
    >
      {/* 21st.dev Style Sidebar */}
      <Lakstari21stSidebar
        activeTab={activeTab}
        onTabChange={handleTabSelect}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

        {/* Top Navbar — 21st.dev style */}
        <header className="admin-topbar" style={{
          height: '56px',
          background: isDark ? '#0F172A' : '#ffffff',
          borderBottom: isDark ? '1px solid #1E293B' : '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 90,
          gap: '12px',
          padding: '0 20px'
        }}>
          {/* Left: Toggle + Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="admin-topbar-toggle-btn"
              onClick={() => setIsSidebarOpen(prev => !prev)}
              aria-label="Buka/Tutup Menu Sidebar"
              title="Buka/Tutup Menu Sidebar"
            >
              <PanelLeftOpenIcon />
            </button>
            <div className="admin-topbar-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <span className="admin-breadcrumb-brand" style={{ color: '#94A3B8' }}>Lakstari</span>
              <span className="admin-breadcrumb-slash" style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ color: isDark ? '#F1F5F9' : '#232B45', fontWeight: 600 }}>{tabLabels[activeTab] || 'Dashboard'}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="admin-header-date-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="admin-date-full">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="admin-date-short">
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />

            <div className="admin-header-divider" />

            <div className="admin-header-user">
              <div className="admin-header-user-text">
                <span style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#F1F5F9' : '#1E293B', lineHeight: 1.3 }}>Admin Lakstari</span>
                <span style={{ fontSize: '10px', color: '#94A3B8', lineHeight: 1.3 }}>Pemilik Toko</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Body with Suspense */}
        <main className="admin-main-content" style={{ flex: 1, padding: '28px' }}>
          <Suspense fallback={<AdminTabSkeleton />}>
            {activeTab === 'dashboard' && <DashboardHome />}
            {activeTab === 'products' && <ProductManager />}
            {activeTab === 'categories' && <CategoryManager />}
            {activeTab === 'orders' && <OrderManager />}
            {activeTab === 'shipments' && <ShipmentManager />}
            {activeTab === 'customers' && <CustomerManager />}
            {activeTab === 'reports' && <ReportManager />}
            {activeTab === 'settings' && <SettingsManager />}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

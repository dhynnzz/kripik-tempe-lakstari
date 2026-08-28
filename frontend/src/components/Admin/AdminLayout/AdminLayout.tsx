import React, { useState, useEffect } from 'react';
import './AdminLayout.css';
import { Lakstari21stSidebar } from './sidebar-component';
import DashboardHome from '../DashboardHome/DashboardHome';
import ProductManager from '../ProductManager/ProductManager';
import CategoryManager from '../CategoryManager/CategoryManager';
import OrderManager from '../OrderManager/OrderManager';
import ShipmentManager from '../ShipmentManager/ShipmentManager';
import CustomerManager from '../CustomerManager/CustomerManager';
import ReportManager from '../ReportManager/ReportManager';
import AdminManager from '../AdminManager/AdminManager';
import SettingsManager from '../SettingsManager/SettingsManager';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import AdminLogin from '../AdminLogin/AdminLogin';
import { apiService } from '../../../services/api';

interface AdminLayoutProps {
  onSwitchToUser?: () => void;
}

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
  admins: "Admin",
  settings: "Pengaturan",
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ onSwitchToUser }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!sessionStorage.getItem('admin_token');
  });

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'categories' | 'orders' | 'shipments' | 'customers' | 'reports' | 'admins' | 'settings'
  >('dashboard');

  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 1024;
    }
    return true;
  });

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
    if (window.confirm('Apakah Anda yakin ingin keluar dari Portal Admin?')) {
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
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} onSwitchToUser={onSwitchToUser} />;
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
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                background: 'transparent', border: 'none',
                borderRadius: '6px', padding: '6px',
                cursor: 'pointer', color: '#64748B',
                display: 'flex', alignItems: 'center',
                transition: 'color 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.05)';
                (e.currentTarget as HTMLElement).style.color = '#232B45';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = '#64748B';
              }}
              title="Toggle Menu Sidebar"
            >
              <PanelLeftOpenIcon />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <span style={{ color: '#94A3B8' }}>Lakstari</span>
              <span style={{ color: '#CBD5E1' }}>/</span>
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
              <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>

            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />

            <div className="admin-header-divider" />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(250,172,48,0.12)',
                border: '1px solid rgba(250,172,48,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 800, color: '#FAAC30',
                flexShrink: 0
              }}>A</div>
              <div className="admin-header-user-text" style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#F1F5F9' : '#1E293B', lineHeight: 1.3 }}>Admin Lakstari</span>
                <span style={{ fontSize: '10px', color: '#94A3B8', lineHeight: 1.3 }}>Pemilik Toko</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="admin-main-content" style={{ flex: 1, padding: '28px' }}>
          {activeTab === 'dashboard' && <DashboardHome />}
          {activeTab === 'products' && <ProductManager />}
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'orders' && <OrderManager />}
          {activeTab === 'shipments' && <ShipmentManager />}
          {activeTab === 'customers' && <CustomerManager />}
          {activeTab === 'reports' && <ReportManager />}
          {activeTab === 'admins' && <AdminManager />}
          {activeTab === 'settings' && <SettingsManager />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

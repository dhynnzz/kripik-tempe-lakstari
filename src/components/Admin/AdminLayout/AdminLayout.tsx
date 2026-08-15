import React, { useState } from 'react';
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

const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!sessionStorage.getItem('admin_token');
  });

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'categories' | 'orders' | 'shipments' | 'customers' | 'reports' | 'admins' | 'settings'
  >('dashboard');

  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari Portal Admin?')) {
      await apiService.logoutAdmin();
      setIsAuthenticated(false);
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
        background: isDark ? '#090D16' : '#F1F5F9',
      }}
    >
      {/* 21st.dev Style Sidebar */}
      <Lakstari21stSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top Navbar — 21st.dev style */}
        <header style={{
          height: '56px',
          background: isDark ? '#0F172A' : '#ffffff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 90,
          gap: '16px',
        }}>
          {/* Left: Toggle + Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
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
              >
                <PanelLeftOpenIcon />
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <span style={{ color: '#94A3B8' }}>Lakstari</span>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ color: '#232B45', fontWeight: 600 }}>{tabLabels[activeTab] || 'Dashboard'}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
            <div style={{
              width: '1px', height: '24px',
              background: 'rgba(0,0,0,0.08)',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(250,172,48,0.12)',
                border: '1px solid rgba(250,172,48,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 800, color: '#FAAC30',
              }}>A</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', lineHeight: 1.3 }}>Admin Lakstari</span>
                <span style={{ fontSize: '10px', color: '#94A3B8', lineHeight: 1.3 }}>Pemilik Toko</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main style={{ padding: '28px', flex: 1 }}>
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

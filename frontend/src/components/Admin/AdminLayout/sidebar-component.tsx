import { useState, type ReactElement } from "react";

/* ─── Lucide-style SVG icons (inline, no dependency) ─── */
function IconLayoutDashboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconPackage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
  );
}
function IconTag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}
function IconShoppingCart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
function IconTruck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconBarChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconLogOut() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}
function IconPanelLeftClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="m16 15-3-3 3-3" />
    </svg>
  );
}
function IconPanelLeftOpen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="m14 9 3 3-3 3" />
    </svg>
  );
}
function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* ─── Brand Logo ─── */
function BrandLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "8px",
        background: "#FAAC30",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#232B45" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>
          Lakstari
        </span>
        <span style={{ fontSize: "12px", color: "#94A3B8", lineHeight: 1.2 }}>
          Admin Portal
        </span>
      </div>
    </div>
  );
}

/* ─── Types ─── */
export interface LakstariSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

/* ─── Menu config ─── */
type MenuItem = {
  id: string;
  label: string;
  icon: () => ReactElement;
  group?: string;
};

const menuGroups: { heading?: string; items: MenuItem[] }[] = [
  {
    items: [
      { id: "dashboard", label: "Dashboard", icon: IconLayoutDashboard },
    ],
  },
  {
    heading: "Katalog",
    items: [
      { id: "products", label: "Produk", icon: IconPackage },
      { id: "categories", label: "Kategori", icon: IconTag },
    ],
  },
  {
    heading: "Transaksi",
    items: [
      { id: "orders", label: "Pesanan", icon: IconShoppingCart },
      { id: "shipments", label: "Pengiriman", icon: IconTruck },
    ],
  },
  {
    heading: "Manajemen",
    items: [
      { id: "customers", label: "Pelanggan", icon: IconUsers },
      { id: "reports", label: "Laporan", icon: IconBarChart },
      { id: "admins", label: "Admin", icon: IconShield },
    ],
  },
];

const bottomItems: MenuItem[] = [
  { id: "settings", label: "Pengaturan", icon: IconSettings },
];

/* ─── Main Sidebar Component ─── */
export function Lakstari21stSidebar({
  activeTab,
  onTabChange,
  onLogout,
  isSidebarOpen = true,
  onToggleSidebar,
}: LakstariSidebarProps) {
  const [internalOpen, setInternalOpen] = useState(true);

  const isOpen = onToggleSidebar ? isSidebarOpen : internalOpen;
  const toggleSidebar = onToggleSidebar ?? (() => setInternalOpen((v) => !v));

  const handleMenuClick = (id: string) => {
    onTabChange(id);
    if (typeof window !== "undefined" && window.innerWidth <= 1024 && isOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Backdrop hanya untuk mobile (layar kecil) saat sidebar terbuka sebagai overlay */}
      {isOpen && typeof window !== 'undefined' && window.innerWidth <= 1024 && (
        <div
          className="lakstari-sidebar-backdrop"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      <div className={`lakstari-sidebar-wrapper ${isOpen ? "is-open" : ""}`} style={{ display: "flex", height: "100vh", position: "sticky", top: 0, zIndex: 100 }}>
        {/* Sidebar Panel */}
        <aside
          className="lakstari-sidebar-aside"
          style={{
            width: isOpen ? "260px" : "0px",
            minWidth: isOpen ? "260px" : "0px",
            height: "100%",
            backgroundColor: "#232B45",
            display: "flex",
            flexDirection: "column",
            padding: isOpen ? "16px 12px" : "0",
            boxSizing: "border-box",
            borderRight: isOpen ? "1px solid rgba(255,255,255,0.07)" : "none",
            overflow: "hidden",
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease",
          }}
        >
          {isOpen && (
            <>
              {/* Brand Header */}
              <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <BrandLogo />
                <button
                  onClick={toggleSidebar}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px",
                    cursor: "pointer",
                    color: "#94A3B8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s, color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
                    (e.currentTarget as HTMLElement).style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLElement).style.color = "#94A3B8";
                  }}
                  title="Tutup Sidebar"
                >
                  <IconPanelLeftClose />
                </button>
              </div>

              {/* Navigation Menu */}
              <div className="lakstari-sidebar-nav" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                {menuGroups.map((group, idx) => (
                  <div key={idx} style={{ marginBottom: "8px" }}>
                    {group.heading && (
                      <div style={{
                        fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em",
                        color: "rgba(148,163,184,0.5)", textTransform: "uppercase",
                        padding: "0 12px", marginBottom: "6px"
                      }}>
                        {group.heading}
                      </div>
                    )}
                    {group.items.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleMenuClick(item.id)}
                            style={{
                              display: "flex", alignItems: "center", gap: "12px",
                              width: "100%", padding: "10px 12px",
                              borderRadius: "8px", border: "none",
                              background: isActive ? "#FAAC30" : "transparent",
                              color: isActive ? "#232B45" : "#94A3B8",
                              fontSize: "15px", fontWeight: isActive ? 700 : 500,
                              cursor: "pointer", textAlign: "left",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                                (e.currentTarget as HTMLElement).style.color = "#ffffff";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                (e.currentTarget as HTMLElement).style.background = "transparent";
                                (e.currentTarget as HTMLElement).style.color = "#94A3B8";
                              }
                            }}
                          >
                            <span style={{ flexShrink: 0 }}><item.icon /></span>
                            <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
                          </button>
                        );
                      })}
                  </div>
                ))}
              </div>

              {/* Bottom Section */}
              <div style={{
                paddingTop: "12px", marginTop: "8px",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                display: "flex", flexDirection: "column", gap: "2px",
              }}>
                {bottomItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        width: "100%", padding: "10px 12px",
                        borderRadius: "8px", border: "none",
                        background: isActive ? "#FAAC30" : "transparent",
                        color: isActive ? "#232B45" : "#94A3B8",
                        fontSize: "15px", fontWeight: isActive ? 700 : 500,
                        cursor: "pointer", textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                          (e.currentTarget as HTMLElement).style.color = "#ffffff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "#94A3B8";
                        }
                      }}
                    >
                      <span style={{ flexShrink: 0 }}><item.icon /></span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                {/* Logout */}
                <button
                  onClick={onLogout}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    width: "100%", padding: "10px 12px",
                    borderRadius: "8px", border: "none",
                    background: "transparent",
                    color: "#94A3B8",
                    fontSize: "15px", fontWeight: 500,
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.12)";
                    (e.currentTarget as HTMLElement).style.color = "#F87171";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#94A3B8";
                  }}
                >
                  <span style={{ flexShrink: 0 }}><IconLogOut /></span>
                  <span>Keluar</span>
                </button>

                {/* Profile */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 12px 4px",
                  marginTop: "6px",
                }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                    background: "rgba(250,172,48,0.15)", border: "1px solid rgba(250,172,48,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "15px", fontWeight: 800, color: "#FAAC30"
                  }}>A</div>
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#E2E8F0", lineHeight: 1.3 }}>Admin Lakstari</span>
                    <span style={{ fontSize: "12px", color: "#64748B", lineHeight: 1.3 }}>Pemilik Toko</span>
                  </div>
                  <button style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", marginLeft: "auto", flexShrink: 0 }}>
                    <IconChevronDown />
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* Floating Toggle Button when sidebar is closed */}
        {!isOpen && (
          <button
            onClick={toggleSidebar}
            style={{
              position: "absolute", left: "8px", top: "16px",
              background: "#232B45", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px", padding: "8px",
              cursor: "pointer", color: "#94A3B8",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 110, boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#FAAC30"}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#94A3B8"}
            title="Buka Sidebar"
          >
            <IconPanelLeftOpen />
          </button>
        )}
      </div>
    </>
  );
}

export default Lakstari21stSidebar;

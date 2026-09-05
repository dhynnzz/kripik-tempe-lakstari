import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../services/api';
import Swal from 'sweetalert2';
import './CustomerManager.css';

interface CustomerItem {
  id_pelanggan: number;
  nama_pelanggan: string;
  no_hp: string;
  email?: string | null;
  status_pelanggan: 'Aktif' | 'Blacklist' | string;
  transaksi_count?: number;
  created_at?: string;
  transaksi?: Array<{
    id_transaksi: number;
    nomor_invoice: string;
    total_bayar: number;
    status_transaksi: string;
    status_pembayaran: string;
    created_at: string;
  }>;
  alamat?: Array<{
    id_alamat?: number;
    alamat_lengkap: string;
    kecamatan?: string;
    kota?: string;
    provinsi?: string;
    kode_pos?: string;
  }>;
}

interface StatsSummary {
  total: number;
  active: number;
  blacklisted: number;
  total_orders: number;
}

const CustomerManager: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [stats, setStats] = useState<StatsSummary>({
    total: 0,
    active: 0,
    blacklisted: 0,
    total_orders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Aktif' | 'Blacklist'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Selected customer for Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch Customers from API
  const fetchCustomers = useCallback(async (page = 1, search = searchQuery, status = statusFilter) => {
    setIsLoading(true);
    try {
      const res = await apiService.getCustomers(page, search, status);
      if (res && res.data) {
        const paginatedData = res.data;
        const items = paginatedData.data || (Array.isArray(paginatedData) ? paginatedData : []);
        setCustomers(items);
        setCurrentPage(paginatedData.current_page || 1);
        setLastPage(paginatedData.last_page || 1);
        setTotalItems(paginatedData.total !== undefined ? paginatedData.total : items.length);

        if (res.stats) {
          setStats(res.stats);
        } else {
          // Fallback stats computation
          const activeCount = items.filter((c: CustomerItem) => String(c.status_pelanggan || '').toLowerCase() === 'aktif').length;
          setStats({
            total: items.length,
            active: activeCount,
            blacklisted: items.length - activeCount,
            total_orders: items.reduce((acc: number, c: CustomerItem) => acc + (c.transaksi_count || 0), 0),
          });
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data pelanggan:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchCustomers(currentPage, searchQuery, statusFilter);
  }, [currentPage, statusFilter]);

  // Handle Search submit / debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCustomers(1, searchQuery, statusFilter);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    fetchCustomers(1, '', statusFilter);
  };

  // Handle Status Update with Confirmation
  const handleStatusChange = async (id: number, customerName: string, newStatus: string) => {
    const isBlacklist = newStatus.toLowerCase() === 'blacklist';
    const confirm = await Swal.fire({
      title: isBlacklist ? 'Blacklist Pelanggan?' : 'Aktifkan Pelanggan?',
      text: isBlacklist
        ? `Pelanggan "${customerName}" akan ditandai sebagai Blacklist dan dibatasi akses transaksinya.`
        : `Pelanggan "${customerName}" akan diaktifkan kembali statusnya.`,
      icon: isBlacklist ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: isBlacklist ? '#EF4444' : '#10B981',
      cancelButtonColor: '#64748B',
      confirmButtonText: isBlacklist ? 'Ya, Blacklist' : 'Ya, Aktifkan',
      cancelButtonText: 'Batal',
    });

    if (confirm.isConfirmed) {
      const success = await apiService.updateCustomerStatus(id, newStatus);
      if (success) {
        Swal.fire({
          icon: 'success',
          title: 'Status Berhasil Diubah',
          text: `Status pelanggan ${customerName} kini menjadi ${newStatus}.`,
          timer: 1800,
          showConfirmButton: false,
        });

        // Update local state smoothly
        setCustomers(prev =>
          prev.map(c => (c.id_pelanggan === id ? { ...c, status_pelanggan: newStatus } : c))
        );

        if (selectedCustomer && selectedCustomer.id_pelanggan === id) {
          setSelectedCustomer(prev => (prev ? { ...prev, status_pelanggan: newStatus } : null));
        }

        fetchCustomers(currentPage, searchQuery, statusFilter);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Mengubah Status',
          text: 'Terjadi kesalahan sistem, silakan coba beberapa saat lagi.',
        });
      }
    }
  };

  // Get Initials for Avatar
  const getInitials = (name: string) => {
    if (!name) return 'PL';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Color generator for avatar based on name string
  const getAvatarBg = (name: string) => {
    const colors = ['#2563EB', '#7C3AED', '#DB2777', '#D97706', '#059669', '#0891B2'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Format currency
  const formatRupiah = (amount: number) => {
    return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Clean WhatsApp number formatting
  const getWhatsAppUrl = (phone: string) => {
    if (!phone) return '#';
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return `https://wa.me/${clean}`;
  };

  // Copy phone helper
  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Nomor telepon disalin!',
      showConfirmButton: false,
      timer: 1500,
    });
  };

  return (
    <div className="customer-manager-root">
      {/* 1. Header Banner */}
      <div className="cm-header-banner">
        <div className="cm-header-text">
          <h2>Data Pelanggan Lakstari</h2>
          <p>Pantau seluruh pelanggan terdaftar, kontak aktif, riwayat pesanan, dan verifikasi status akun.</p>
        </div>
        <div className="cm-header-actions">
          <button
            className="btn-cm-refresh"
            onClick={() => fetchCustomers(currentPage, searchQuery, statusFilter)}
            title="Muat ulang data"
            disabled={isLoading}
          >
            <svg
              className={isLoading ? 'cm-spinning' : ''}
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
            <span>{isLoading ? 'Memuat...' : 'Segarkan Data'}</span>
          </button>
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className="cm-stats-grid">
        <div className="cm-stat-card">
          <div className="cm-stat-icon-wrap" style={{ backgroundColor: 'rgba(37, 99, 235, 0.12)', color: '#2563EB' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="cm-stat-body">
            <span className="cm-stat-label">Total Pelanggan</span>
            <div className="cm-stat-value">{stats.total.toLocaleString('id-ID')}</div>
            <span className="cm-stat-hint">Terdaftar di toko Lakstari</span>
          </div>
        </div>

        <div className="cm-stat-card">
          <div className="cm-stat-icon-wrap" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="cm-stat-body">
            <span className="cm-stat-label">Pelanggan Aktif</span>
            <div className="cm-stat-value" style={{ color: '#059669' }}>
              {stats.active.toLocaleString('id-ID')}
            </div>
            <span className="cm-stat-hint">Dapat melakukan checkout</span>
          </div>
        </div>

        <div className="cm-stat-card">
          <div className="cm-stat-icon-wrap" style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <div className="cm-stat-body">
            <span className="cm-stat-label">Blacklist / Dibatasi</span>
            <div className="cm-stat-value" style={{ color: '#DC2626' }}>
              {stats.blacklisted.toLocaleString('id-ID')}
            </div>
            <span className="cm-stat-hint">Akses transaksi dinonaktifkan</span>
          </div>
        </div>

        <div className="cm-stat-card">
          <div className="cm-stat-icon-wrap" style={{ backgroundColor: 'rgba(250, 172, 48, 0.16)', color: '#D97706' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div className="cm-stat-body">
            <span className="cm-stat-label">Total Transaksi</span>
            <div className="cm-stat-value" style={{ color: '#B45309' }}>
              {stats.total_orders.toLocaleString('id-ID')}
            </div>
            <span className="cm-stat-hint">Akumulasi seluruh order</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="cm-filter-bar">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="cm-search-form">
          <div className="cm-search-input-wrap">
            <svg className="cm-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama, WhatsApp, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cm-search-input"
            />
            {searchQuery && (
              <button type="button" onClick={handleClearSearch} className="cm-btn-clear-search" title="Hapus pencarian">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          <button type="submit" className="cm-btn-search">
            Cari
          </button>
        </form>

        {/* Status Filter Chips */}
        <div className="cm-status-chips">
          <button
            type="button"
            className={`cm-chip ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
          >
            Semua ({stats.total})
          </button>
          <button
            type="button"
            className={`cm-chip chip-active ${statusFilter === 'Aktif' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('Aktif'); setCurrentPage(1); }}
          >
            Aktif ({stats.active})
          </button>
          <button
            type="button"
            className={`cm-chip chip-blacklist ${statusFilter === 'Blacklist' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('Blacklist'); setCurrentPage(1); }}
          >
            Blacklist ({stats.blacklisted})
          </button>
        </div>
      </div>

      {/* 4. Content Area: Table for Desktop & Cards for Mobile */}
      <div className="cm-content-card">
        {/* Results Counter Header */}
        <div className="cm-card-top-bar">
          <div className="cm-counter-text">
            <span>Menampilkan <strong>{customers.length}</strong> dari <strong>{totalItems}</strong> pelanggan</span>
            {searchQuery && (
              <span className="cm-filter-tag">
                Filter: "{searchQuery}"
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="cm-loading-state">
            <div className="cm-spinner"></div>
            <span>Memuat data pelanggan...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="cm-empty-state">
            <div className="cm-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <h4>Tidak Ada Pelanggan Ditemukan</h4>
            <p>
              {searchQuery
                ? `Tidak ada pelanggan yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : 'Belum ada data pelanggan yang terdaftar saat ini.'}
            </p>
            {searchQuery && (
              <button onClick={handleClearSearch} className="cm-btn-reset">
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── DESKTOP TABLE VIEW (Visible on >= 768px) ── */}
            <div className="cm-desktop-table-wrap">
              <table className="cm-table">
                <thead>
                  <tr>
                    <th>Pelanggan</th>
                    <th>Kontak (WhatsApp / Email)</th>
                    <th style={{ textAlign: 'center' }}>Total Order</th>
                    <th>Status Akun</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const isAktif = String(c.status_pelanggan || '').toLowerCase() === 'aktif';
                    return (
                      <tr key={c.id_pelanggan} className="cm-table-row">
                        {/* Customer Info */}
                        <td>
                          <div className="cm-user-cell">
                            <div className="cm-avatar">
                              {getInitials(c.nama_pelanggan)}
                            </div>
                            <div className="cm-user-details">
                              <span className="cm-user-name">{c.nama_pelanggan}</span>
                              <span className="cm-user-joined">
                                Terdaftar: {formatDate(c.created_at)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact Cell */}
                        <td>
                          <div className="cm-contact-cell">
                            <div className="cm-phone-row">
                              <a
                                href={getWhatsAppUrl(c.no_hp)}
                                target="_blank"
                                rel="noreferrer"
                                className="cm-phone-link"
                                title="Hubungi via WhatsApp"
                              >
                                <svg className="cm-wa-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <span>{c.no_hp}</span>
                              </a>
                              <button
                                type="button"
                                className="cm-btn-copy"
                                onClick={() => handleCopyPhone(c.no_hp)}
                                title="Salin nomor"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                              </button>
                            </div>
                            {c.email && (
                              <a href={`mailto:${c.email}`} className="cm-email-link">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                  <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <span>{c.email}</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Order Count */}
                        <td style={{ textAlign: 'center' }}>
                          <span className="cm-order-count">
                            <strong>{c.transaksi_count || 0}</strong> pesanan
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td>
                          <span className={`cm-status-pill ${isAktif ? 'aktif' : 'blacklist'}`}>
                            <span className="cm-status-indicator"></span>
                            {isAktif ? 'Aktif' : 'Blacklist'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="cm-actions-cell">
                            <button
                              type="button"
                              className="cm-btn-detail"
                              onClick={() => {
                                setSelectedCustomer(c);
                                setIsDetailModalOpen(true);
                              }}
                              title="Lihat Detail & Riwayat Pesanan"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              <span>Detail</span>
                            </button>

                            <select
                              className="cm-select-status"
                              value={isAktif ? 'Aktif' : 'Blacklist'}
                              onChange={(e) => handleStatusChange(c.id_pelanggan, c.nama_pelanggan, e.target.value)}
                            >
                              <option value="Aktif">Aktif</option>
                              <option value="Blacklist">Blacklist</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── MOBILE CARDS VIEW (Visible on < 768px) ── */}
            <div className="cm-mobile-list">
              {customers.map((c) => {
                const isAktif = String(c.status_pelanggan || '').toLowerCase() === 'aktif';
                return (
                  <div key={c.id_pelanggan} className="cm-card-item">
                    {/* Card Top: Avatar, Name, and Status */}
                    <div className="cm-card-header">
                      <div className="cm-user-cell">
                        <div className="cm-avatar">
                          {getInitials(c.nama_pelanggan)}
                        </div>
                        <div className="cm-user-details">
                          <span className="cm-user-name">{c.nama_pelanggan}</span>
                          <span className="cm-user-joined">
                            ID: #{c.id_pelanggan} • {formatDate(c.created_at)}
                          </span>
                        </div>
                      </div>
                      <span className={`cm-status-pill ${isAktif ? 'aktif' : 'blacklist'}`}>
                        {isAktif ? 'Aktif' : 'Blacklist'}
                      </span>
                    </div>

                    {/* Card Body: Phone, Email, Order Count */}
                    <div className="cm-card-body">
                      <div className="cm-mobile-info-row">
                        <span className="cm-info-label">WhatsApp:</span>
                        <div className="cm-phone-row">
                          <a
                            href={getWhatsAppUrl(c.no_hp)}
                            target="_blank"
                            rel="noreferrer"
                            className="cm-phone-link"
                          >
                            <svg className="cm-wa-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <span>{c.no_hp}</span>
                          </a>
                          <button
                            type="button"
                            className="cm-btn-copy"
                            onClick={() => handleCopyPhone(c.no_hp)}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {c.email && (
                        <div className="cm-mobile-info-row">
                          <span className="cm-info-label">Email:</span>
                          <a href={`mailto:${c.email}`} className="cm-email-link">
                            {c.email}
                          </a>
                        </div>
                      )}

                      <div className="cm-mobile-info-row">
                        <span className="cm-info-label">Transaksi:</span>
                        <span className="cm-order-count">
                          <strong>{c.transaksi_count || 0}</strong> kali belanja
                        </span>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="cm-card-actions">
                      <button
                        type="button"
                        className="cm-btn-detail-mobile"
                        onClick={() => {
                          setSelectedCustomer(c);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        Lihat Riwayat
                      </button>

                      <select
                        className="cm-select-status-mobile"
                        value={isAktif ? 'Aktif' : 'Blacklist'}
                        onChange={(e) => handleStatusChange(c.id_pelanggan, c.nama_pelanggan, e.target.value)}
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Blacklist">Blacklist</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* 5. Pagination Bar */}
        {!isLoading && totalItems > 0 && lastPage > 1 && (
          <div className="cm-pagination-bar">
            <div className="cm-pagination-info">
              Halaman <strong>{currentPage}</strong> dari <strong>{lastPage}</strong>
            </div>
            <div className="cm-pagination-controls">
              <button
                type="button"
                className="cm-btn-page"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>Sebelumnya</span>
              </button>

              <button
                type="button"
                className="cm-btn-page"
                onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                disabled={currentPage === lastPage}
              >
                <span>Berikutnya</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CUSTOMER DETAIL MODAL ── */}
      {isDetailModalOpen && selectedCustomer && (
        <div className="cm-modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
          <div className="cm-modal-box" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="cm-modal-header">
              <div className="cm-modal-user-summary">
                <div
                  className="cm-avatar-lg"
                  style={{ backgroundColor: getAvatarBg(selectedCustomer.nama_pelanggan) }}
                >
                  {getInitials(selectedCustomer.nama_pelanggan)}
                </div>
                <div>
                  <h3>{selectedCustomer.nama_pelanggan}</h3>
                  <span className="cm-modal-joined">
                    Terdaftar sejak {formatDate(selectedCustomer.created_at)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="cm-btn-close-modal"
                onClick={() => setIsDetailModalOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="cm-modal-body">
              {/* Quick Info Grid */}
              <div className="cm-modal-info-grid">
                <div className="cm-modal-info-item">
                  <span className="cm-m-label">Nomor WhatsApp</span>
                  <div className="cm-m-val-row">
                    <strong>{selectedCustomer.no_hp}</strong>
                    <a
                      href={getWhatsAppUrl(selectedCustomer.no_hp)}
                      target="_blank"
                      rel="noreferrer"
                      className="cm-btn-contact-wa"
                    >
                      Buka Chat
                    </a>
                  </div>
                </div>

                <div className="cm-modal-info-item">
                  <span className="cm-m-label">Email</span>
                  <div className="cm-m-val-row">
                    <strong>{selectedCustomer.email || 'Tidak dicantumkan'}</strong>
                  </div>
                </div>

                <div className="cm-modal-info-item">
                  <span className="cm-m-label">Status Akun</span>
                  <div className="cm-m-val-row">
                    {(() => {
                      const isModalAktif = String(selectedCustomer.status_pelanggan || '').toLowerCase() === 'aktif';
                      return (
                        <>
                          <span className={`cm-status-pill ${isModalAktif ? 'aktif' : 'blacklist'}`}>
                            <span className="cm-status-indicator"></span>
                            {isModalAktif ? 'Aktif' : 'Blacklist'}
                          </span>
                          <button
                            type="button"
                            className="cm-btn-toggle-status"
                            onClick={() =>
                              handleStatusChange(
                                selectedCustomer.id_pelanggan,
                                selectedCustomer.nama_pelanggan,
                                isModalAktif ? 'Blacklist' : 'Aktif'
                              )
                            }
                          >
                            Ubah ke {isModalAktif ? 'Blacklist' : 'Aktif'}
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="cm-modal-info-item">
                  <span className="cm-m-label">Total Transaksi</span>
                  <div className="cm-m-val-row">
                    <strong>{selectedCustomer.transaksi_count || 0} Transaksi</strong>
                  </div>
                </div>
              </div>

              {/* Alamat Tersimpan */}
              {selectedCustomer.alamat && selectedCustomer.alamat.length > 0 && (
                <div className="cm-modal-section">
                  <h4>Alamat Pengiriman Tersimpan</h4>
                  <div className="cm-modal-address-list">
                    {selectedCustomer.alamat.map((alm, idx) => (
                      <div key={idx} className="cm-modal-address-box">
                        <p>{alm.alamat_lengkap}</p>
                        <small>
                          {[alm.kecamatan, alm.kota, alm.provinsi, alm.kode_pos]
                            .filter(Boolean)
                            .join(', ')}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Riwayat 5 Transaksi Terakhir */}
              <div className="cm-modal-section">
                <h4>Riwayat Transaksi Terakhir</h4>
                {selectedCustomer.transaksi && selectedCustomer.transaksi.length > 0 ? (
                  <div className="cm-modal-orders-list">
                    {selectedCustomer.transaksi.map((t) => (
                      <div key={t.id_transaksi} className="cm-modal-order-row">
                        <div className="cm-order-info-col">
                          <strong>{t.nomor_invoice}</strong>
                          <span>{formatDate(t.created_at)}</span>
                        </div>
                        <div className="cm-order-amount-col">
                          <strong>{formatRupiah(t.total_bayar)}</strong>
                          <span
                            className={`cm-order-status-tag ${
                              t.status_transaksi === 'selesai'
                                ? 'selesai'
                                : t.status_transaksi === 'dibatalkan'
                                ? 'batal'
                                : 'proses'
                            }`}
                          >
                            {t.status_transaksi?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="cm-modal-empty-orders">
                    Belum ada riwayat pesanan yang tercatat untuk pelanggan ini.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="cm-modal-footer">
              <button
                type="button"
                className="cm-btn-close"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManager;

import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../services/api';
import Swal from 'sweetalert2';
import './CustomerManager.css';

interface CustomerItem {
  id_pelanggan: number;
  nama_pelanggan: string;
  no_hp: string;
  email?: string | null;
  status_pelanggan: string;
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
          const activeCount = items.filter((c: CustomerItem) => (c.status_pelanggan || '').toLowerCase() === 'aktif').length;
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

  // Handle Status Update
  const handleStatusChange = async (id: number, customerName: string, newStatus: string) => {
    const isBlacklist = newStatus.toLowerCase() === 'blacklist';
    const confirm = await Swal.fire({
      title: isBlacklist ? 'Blacklist Pelanggan?' : 'Aktifkan Pelanggan?',
      text: isBlacklist
        ? `Pelanggan "${customerName}" akan ditandai sebagai Blacklist.`
        : `Pelanggan "${customerName}" akan diaktifkan kembali.`,
      icon: isBlacklist ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Ya, Ubah Status',
      cancelButtonText: 'Batal',
    });

    if (confirm.isConfirmed) {
      const success = await apiService.updateCustomerStatus(id, newStatus);
      if (success) {
        Swal.fire({
          icon: 'success',
          title: 'Status Berhasil Diubah',
          text: `Status pelanggan ${customerName} kini menjadi ${newStatus}.`,
          timer: 1500,
          showConfirmButton: false,
        });

        setCustomers(prev =>
          prev.map(c => (c.id_pelanggan === id ? { ...c, status_pelanggan: newStatus } : c))
        );

        if (selectedCustomer && selectedCustomer.id_pelanggan === id) {
          setSelectedCustomer(prev => (prev ? { ...prev, status_pelanggan: newStatus } : null));
        }

        fetchCustomers(currentPage, searchQuery, statusFilter);
      }
    }
  };

  // Helper isAktif case-insensitive
  const isCustomerActive = (status?: string) => {
    return (status || '').toLowerCase() === 'aktif';
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

  // Copy phone helper
  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Nomor telepon disalin',
      showConfirmButton: false,
      timer: 1200,
    });
  };

  return (
    <div className="customer-manager-root">
      {/* 1. Header (Clean, Plain White Header - No Gradient) */}
      <div className="cm-header-plain">
        <div className="cm-header-titles">
          <h2>Data Pelanggan</h2>
          <p>Kelola data pelanggan terdaftar, kontak, dan riwayat transaksi toko.</p>
        </div>
        <div className="cm-header-actions">
          <button
            type="button"
            className="btn-cm-plain"
            onClick={() => fetchCustomers(currentPage, searchQuery, statusFilter)}
            disabled={isLoading}
          >
            <svg
              className={isLoading ? 'cm-spinning' : ''}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{isLoading ? 'Memuat...' : 'Segarkan'}</span>
          </button>
        </div>
      </div>

      {/* 2. Stat Metric Cards (Plain, Standard Look) */}
      <div className="cm-stats-grid">
        <div className="cm-stat-card">
          <span className="cm-stat-label">Total Pelanggan</span>
          <div className="cm-stat-value">{stats.total.toLocaleString('id-ID')}</div>
          <span className="cm-stat-hint">Terdaftar di sistem</span>
        </div>

        <div className="cm-stat-card">
          <span className="cm-stat-label">Pelanggan Aktif</span>
          <div className="cm-stat-value">{stats.active.toLocaleString('id-ID')}</div>
          <span className="cm-stat-hint">Akun aktif</span>
        </div>

        <div className="cm-stat-card">
          <span className="cm-stat-label">Pelanggan Blacklist</span>
          <div className="cm-stat-value">{stats.blacklisted.toLocaleString('id-ID')}</div>
          <span className="cm-stat-hint">Akses dibatasi</span>
        </div>

        <div className="cm-stat-card">
          <span className="cm-stat-label">Total Transaksi</span>
          <div className="cm-stat-value">{stats.total_orders.toLocaleString('id-ID')}</div>
          <span className="cm-stat-hint">Pesanan masuk</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="cm-filter-bar">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="cm-search-form">
          <div className="cm-search-input-wrap">
            <svg className="cm-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama, nomor HP, atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cm-search-input"
            />
            {searchQuery && (
              <button type="button" onClick={handleClearSearch} className="cm-btn-clear-search">
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="cm-btn-search">
            Cari
          </button>
        </form>

        {/* Status Filter Buttons */}
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
            className={`cm-chip ${statusFilter === 'Aktif' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('Aktif'); setCurrentPage(1); }}
          >
            Aktif ({stats.active})
          </button>
          <button
            type="button"
            className={`cm-chip ${statusFilter === 'Blacklist' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('Blacklist'); setCurrentPage(1); }}
          >
            Blacklist ({stats.blacklisted})
          </button>
        </div>
      </div>

      {/* 4. Table & Cards Area */}
      <div className="cm-content-card">
        <div className="cm-card-top-bar">
          <span className="cm-counter-text">
            Menampilkan <strong>{customers.length}</strong> dari <strong>{totalItems}</strong> pelanggan
          </span>
        </div>

        {isLoading ? (
          <div className="cm-loading-state">
            <div className="cm-spinner"></div>
            <span>Memuat data pelanggan...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="cm-empty-state">
            <p>
              {searchQuery
                ? `Tidak ada pelanggan yang cocok dengan kata kunci "${searchQuery}".`
                : 'Belum ada data pelanggan yang terdaftar.'}
            </p>
            {searchQuery && (
              <button onClick={handleClearSearch} className="cm-btn-reset">
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── DESKTOP TABLE VIEW (Standard, Clean, Plain Look) ── */}
            <div className="cm-desktop-table-wrap">
              <table className="cm-table">
                <thead>
                  <tr>
                    <th>Nama Pelanggan</th>
                    <th>Kontak (HP & Email)</th>
                    <th>Jumlah Order</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const isAktif = isCustomerActive(c.status_pelanggan);
                    const statusValue = isAktif ? 'Aktif' : 'Blacklist';

                    return (
                      <tr key={c.id_pelanggan} className="cm-table-row">
                        {/* Nama Pelanggan */}
                        <td>
                          <div className="cm-customer-name-cell">
                            <strong>{c.nama_pelanggan}</strong>
                            <small className="cm-joined-date">
                              Terdaftar: {formatDate(c.created_at)}
                            </small>
                          </div>
                        </td>

                        {/* Kontak (Plain text, no bright green pills) */}
                        <td>
                          <div className="cm-contact-cell-plain">
                            <div className="cm-phone-row-plain">
                              <span className="cm-phone-text">{c.no_hp || '-'}</span>
                              {c.no_hp && (
                                <button
                                  type="button"
                                  className="cm-btn-copy-plain"
                                  onClick={() => handleCopyPhone(c.no_hp)}
                                  title="Salin nomor"
                                >
                                  Salin
                                </button>
                              )}
                            </div>
                            {c.email && (
                              <span className="cm-email-text-plain">{c.email}</span>
                            )}
                          </div>
                        </td>

                        {/* Jumlah Order (Plain text, no blue capsules) */}
                        <td>
                          <span className="cm-order-count-text">
                            {c.transaksi_count || 0} Order
                          </span>
                        </td>

                        {/* Status (Clean standard badge) */}
                        <td>
                          <span className={`cm-status-tag ${isAktif ? 'status-aktif' : 'status-blacklist'}`}>
                            {isAktif ? 'Aktif' : 'Blacklist'}
                          </span>
                        </td>

                        {/* Aksi (Standard buttons, clean gray dropdown) */}
                        <td>
                          <div className="cm-actions-cell">
                            <button
                              type="button"
                              className="cm-btn-detail-plain"
                              onClick={() => {
                                setSelectedCustomer(c);
                                setIsDetailModalOpen(true);
                              }}
                            >
                              Detail
                            </button>

                            <select
                              className="cm-select-plain"
                              value={statusValue}
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

            {/* ── MOBILE CARDS VIEW (Clean, Simple) ── */}
            <div className="cm-mobile-list">
              {customers.map((c) => {
                const isAktif = isCustomerActive(c.status_pelanggan);
                const statusValue = isAktif ? 'Aktif' : 'Blacklist';

                return (
                  <div key={c.id_pelanggan} className="cm-card-item">
                    <div className="cm-card-header">
                      <div>
                        <strong className="cm-mobile-name">{c.nama_pelanggan}</strong>
                        <div className="cm-mobile-date">ID #{c.id_pelanggan} • {formatDate(c.created_at)}</div>
                      </div>
                      <span className={`cm-status-tag ${isAktif ? 'status-aktif' : 'status-blacklist'}`}>
                        {isAktif ? 'Aktif' : 'Blacklist'}
                      </span>
                    </div>

                    <div className="cm-card-body">
                      <div className="cm-mobile-row">
                        <span className="cm-lbl">No. HP:</span>
                        <div className="cm-phone-row-plain">
                          <span className="cm-phone-text">{c.no_hp || '-'}</span>
                          {c.no_hp && (
                            <button
                              type="button"
                              className="cm-btn-copy-plain"
                              onClick={() => handleCopyPhone(c.no_hp)}
                            >
                              Salin
                            </button>
                          )}
                        </div>
                      </div>

                      {c.email && (
                        <div className="cm-mobile-row">
                          <span className="cm-lbl">Email:</span>
                          <span className="cm-val">{c.email}</span>
                        </div>
                      )}

                      <div className="cm-mobile-row">
                        <span className="cm-lbl">Jumlah Order:</span>
                        <span className="cm-val"><strong>{c.transaksi_count || 0}</strong> Order</span>
                      </div>
                    </div>

                    <div className="cm-card-actions">
                      <button
                        type="button"
                        className="cm-btn-detail-plain"
                        style={{ flex: 1 }}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        Lihat Riwayat
                      </button>

                      <select
                        className="cm-select-plain"
                        value={statusValue}
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
            <span className="cm-pagination-info">
              Halaman {currentPage} dari {lastPage}
            </span>
            <div className="cm-pagination-controls">
              <button
                type="button"
                className="cm-btn-page"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </button>
              <button
                type="button"
                className="cm-btn-page"
                onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                disabled={currentPage === lastPage}
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CUSTOMER DETAIL MODAL (Clean & Plain) ── */}
      {isDetailModalOpen && selectedCustomer && (
        <div className="cm-modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
          <div className="cm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="cm-modal-header">
              <div>
                <h3>Detail Pelanggan: {selectedCustomer.nama_pelanggan}</h3>
                <small>Terdaftar sejak {formatDate(selectedCustomer.created_at)}</small>
              </div>
              <button
                type="button"
                className="cm-btn-close-modal"
                onClick={() => setIsDetailModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="cm-modal-body">
              <div className="cm-detail-grid">
                <div className="cm-detail-item">
                  <span className="cm-d-label">Nomor Telepon</span>
                  <span className="cm-d-val">{selectedCustomer.no_hp || '-'}</span>
                </div>
                <div className="cm-detail-item">
                  <span className="cm-d-label">Email</span>
                  <span className="cm-d-val">{selectedCustomer.email || '-'}</span>
                </div>
                <div className="cm-detail-item">
                  <span className="cm-d-label">Status Akun</span>
                  <span className="cm-d-val">
                    <span className={`cm-status-tag ${isCustomerActive(selectedCustomer.status_pelanggan) ? 'status-aktif' : 'status-blacklist'}`}>
                      {isCustomerActive(selectedCustomer.status_pelanggan) ? 'Aktif' : 'Blacklist'}
                    </span>
                  </span>
                </div>
                <div className="cm-detail-item">
                  <span className="cm-d-label">Total Transaksi</span>
                  <span className="cm-d-val">{selectedCustomer.transaksi_count || 0} Kali Belanja</span>
                </div>
              </div>

              {selectedCustomer.alamat && selectedCustomer.alamat.length > 0 && (
                <div className="cm-detail-section">
                  <h4>Alamat Tersimpan</h4>
                  {selectedCustomer.alamat.map((alm, idx) => (
                    <div key={idx} className="cm-address-item">
                      <p>{alm.alamat_lengkap}</p>
                      <small>{[alm.kecamatan, alm.kota, alm.provinsi, alm.kode_pos].filter(Boolean).join(', ')}</small>
                    </div>
                  ))}
                </div>
              )}

              <div className="cm-detail-section">
                <h4>Riwayat 5 Pesanan Terakhir</h4>
                {selectedCustomer.transaksi && selectedCustomer.transaksi.length > 0 ? (
                  <div className="cm-orders-table-wrap">
                    <table className="cm-modal-orders-table">
                      <thead>
                        <tr>
                          <th>Invoice</th>
                          <th>Tanggal</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCustomer.transaksi.map((t) => (
                          <tr key={t.id_transaksi}>
                            <td><strong>{t.nomor_invoice}</strong></td>
                            <td>{formatDate(t.created_at)}</td>
                            <td>{formatRupiah(t.total_bayar)}</td>
                            <td>
                              <span className="cm-status-tag status-aktif">
                                {t.status_transaksi?.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="cm-empty-orders-text">Belum ada pesanan yang tercatat.</p>
                )}
              </div>
            </div>

            <div className="cm-modal-footer">
              <button
                type="button"
                className="btn-cm-plain"
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

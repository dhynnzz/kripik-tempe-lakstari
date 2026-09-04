import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './CategoryManager.css';
import { useCategory } from '../../../context/CategoryContext';
import { useProducts } from '../../../context/ProductContext';

const CategoryManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, toggleCategoryStatus } = useCategory();
  const { products, updateProductsCategory } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [catName, setCatName] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  const openAddModal = () => {
    setEditingId(null);
    setCatName('');
    setIsModalOpen(true);
  };

  const openEditModal = (id: number, currentName: string) => {
    setEditingId(id);
    setCatName(currentName);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: 'Hapus Kategori?',
      text: `Apakah Anda yakin ingin menghapus kategori "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
      const res = await deleteCategory(id);
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'Terhapus!',
          text: `Kategori "${name}" berhasil dihapus.`,
          timer: 1600,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Tidak Dapat Menghapus',
          text: res.message || 'Gagal menghapus kategori dari server.',
        });
      }
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingId) {
      const oldCat = categories.find(c => c.id === editingId);
      const res = await updateCategory(editingId, catName);
      if (res.success) {
        if (oldCat && oldCat.name !== catName) {
          updateProductsCategory(oldCat.name, catName);
        }
        setIsModalOpen(false);
        setCatName('');
        setEditingId(null);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Diperbarui!',
          text: `Kategori "${catName}" berhasil diperbarui.`,
          timer: 1600,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memperbarui',
          text: res.message || 'Terjadi kendala saat memperbarui kategori.',
        });
      }
    } else {
      const res = await addCategory(catName);
      if (res.success) {
        setIsModalOpen(false);
        setCatName('');
        setEditingId(null);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Ditambahkan!',
          text: `Kategori "${catName}" berhasil ditambahkan ke daftar.`,
          timer: 1600,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menambahkan',
          text: res.message || 'Terjadi kendala saat menyimpan kategori baru.',
        });
      }
    }
  };

  // Kalkulasi Summary
  const totalKategori = categories.length;
  // Hitung total produk yang kategorinya ada di list kategori (atau sekadar products.length)
  const totalProduk = products.length;
  const kategoriAktif = categories.filter(c => c.status === 'aktif').length;

  // Filter Categories
  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Semua Status' ||
      (statusFilter === 'Aktif' && cat.status === 'aktif') ||
      (statusFilter === 'Nonaktif' && cat.status === 'nonaktif');
    return matchesSearch && matchesStatus;
  }).sort((a, b) => (a.id ?? 0) - (b.id ?? 0));



  return (
    <div className="category-manager-container">
      {/* Header Banner */}
      <div className="cat-header">
        <div>
          <h2>Kategori Produk</h2>
          <p>Kelola kategori produk untuk mempermudah katalog dan pencarian pelanggan.</p>
        </div>
        <button className="btn-add-category" onClick={openAddModal}>
          + Tambah Kategori Baru
        </button>
      </div>

      {/* Summary Cards (Separate Individual Cards) */}
      <div className="cat-summary-cards">
        <div className="cat-summary-card">
          <div className="cat-icon-wrap" style={{ color: '#0EA5E9', background: '#F0F9FF' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
              <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
            </svg>
          </div>
          <div className="cat-summary-info">
            <h3>{totalKategori}</h3>
            <p>Total Kategori</p>
          </div>
        </div>

        <div className="cat-summary-card">
          <div className="cat-icon-wrap" style={{ color: '#6366F1', background: '#EEF2FF' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7.5 4.27 9 5.15" />
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </div>
          <div className="cat-summary-info">
            <h3>{totalProduk}</h3>
            <p>Total Produk</p>
          </div>
        </div>

        <div className="cat-summary-card">
          <div className="cat-icon-wrap" style={{ color: '#16A34A', background: '#F0FDF4' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="cat-summary-info">
            <h3>{kategoriAktif}</h3>
            <p>Kategori Aktif</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="cat-table-card">
        {/* Toolbar */}
        <div className="cat-toolbar">
          <div className="cat-search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Cari kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="cat-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>

        {/* Table */}
        <div className="cat-table-responsive">
          <table className="cat-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAMA KATEGORI</th>
                <th>JUMLAH PRODUK</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'center' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => {
                const count = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;

                return (
                  <tr key={cat.id}>
                    <td style={{ color: '#1E293B', fontWeight: 600 }}>#{cat.id}</td>
                    <td>
                      <div className="cat-name-cell">
                        <div className="cat-name-info">
                          <strong className="cat-name-text">{cat.name}</strong>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#475569' }}>{count} Produk</td>
                    <td>
                      <button
                        className={`cat-status-pill ${cat.status === 'aktif' ? 'aktif' : 'nonaktif'}`}
                        onClick={() => cat.id !== undefined && toggleCategoryStatus(cat.id)}
                        title="Klik untuk mengubah status"
                      >
                        {cat.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'center', position: 'relative' }}>
                      <button
                        className="cat-dots-btn"
                        onClick={() => setActiveMenuId(activeMenuId === cat.id ? null : (cat.id ?? null))}
                        title="Pilihan Aksi"
                      >
                        ⋮
                      </button>

                      {activeMenuId === cat.id && (
                        <React.Fragment>
                          <div className="cat-dropdown-overlay" onClick={() => setActiveMenuId(null)}></div>
                          <div className="cat-action-dropdown">
                            <button
                              onClick={() => {
                                if (cat.id !== undefined) openEditModal(cat.id, cat.name);
                                setActiveMenuId(null);
                              }}
                            >
                              Edit Kategori
                            </button>

                            <button
                              className="danger"
                              onClick={() => {
                                if (cat.id !== undefined) handleDelete(cat.id, cat.name);
                                setActiveMenuId(null);
                              }}
                            >
                              Hapus Kategori
                            </button>
                          </div>
                        </React.Fragment>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    Kategori tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Category Cards (<= 768px: 100% full-width, zero horizontal scroll) */}
        <div className="cat-mobile-cards-list">
          {filteredCategories.length === 0 ? (
            <div className="cat-mob-empty">
              Kategori tidak ditemukan.
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const count = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
              return (
                <div key={cat.id} className="cat-mob-card">
                  {/* Top: Name, ID, & Status Pill */}
                  <div className="cat-mob-card-header">
                    <div className="cat-mob-name-wrap">
                      <span className="cat-mob-id">#{cat.id}</span>
                      <h4 className="cat-mob-name">{cat.name}</h4>
                    </div>
                    <button
                      type="button"
                      className={`cat-status-pill ${cat.status === 'aktif' ? 'aktif' : 'nonaktif'}`}
                      onClick={() => cat.id !== undefined && toggleCategoryStatus(cat.id)}
                      title="Klik untuk mengubah status"
                    >
                      <span className="cat-mob-dot"></span>
                      {cat.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>

                  {/* Body: Product Count Badge */}
                  <div className="cat-mob-card-body">
                    <div className="cat-mob-count-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m7.5 4.27 9 5.15" />
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                      <span>{count} Produk Terdaftar</span>
                    </div>
                  </div>

                  {/* Footer: Quick Action Buttons */}
                  <div className="cat-mob-card-footer">
                    <button
                      type="button"
                      className="cat-mob-btn-edit"
                      onClick={() => cat.id !== undefined && openEditModal(cat.id, cat.name)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="cat-mob-btn-delete"
                      onClick={() => cat.id !== undefined && handleDelete(cat.id, cat.name)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Tambah/Edit Kategori */}
      {isModalOpen && (
        <div className="cat-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="cat-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="cat-modal-header">
              <h3>{editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
              <button
                type="button"
                className="cat-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                title="Tutup"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="cat-modal-form">
              <div className="cat-modal-group">
                <label>Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kripik Tempe Pedas"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                />
              </div>

              <div className="cat-modal-actions">
                <button type="submit" className="cat-modal-submit-btn">
                  {editingId ? 'Simpan Perubahan' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;

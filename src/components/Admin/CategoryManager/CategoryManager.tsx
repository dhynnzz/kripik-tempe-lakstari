import React, { useState } from 'react';
import './CategoryManager.css';
import { useCategory } from '../../../context/CategoryContext';
import { useProducts } from '../../../context/ProductContext';

const CategoryManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, toggleCategoryStatus } = useCategory();
  const { products, updateProductsCategory } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [catName, setCatName] = useState('');

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

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingId) {
      const oldCat = categories.find(c => c.id === editingId);
      updateCategory(editingId, catName);
      if (oldCat && oldCat.name !== catName) {
        updateProductsCategory(oldCat.name, catName);
      }
    } else {
      addCategory(catName);
    }

    setIsModalOpen(false);
    setCatName('');
    setEditingId(null);
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
      {/* Tombol Tambah (Dipindah ke atas untuk keleluasaan) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#1E293B' }}>Kategori Produk</h2>
        <button className="btn-add-category" onClick={openAddModal}>
          ➕ Tambah Kategori Baru
        </button>
      </div>

      {/* Summary Cards */}
      <div className="cat-summary-cards">
        <div className="cat-summary-card">
          <div className="cat-icon-wrap" style={{ color: '#0EA5E9' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
              <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
            </svg>
          </div>
          <div className="cat-summary-info">
            <h3>{totalKategori}</h3>
            <p>Total Kategori</p>
          </div>
        </div>

        <div className="cat-summary-divider"></div>

        <div className="cat-summary-card">
          <div className="cat-icon-wrap" style={{ color: '#4F46E5' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

        <div className="cat-summary-divider"></div>

        <div className="cat-summary-card">
          <div className="cat-icon-wrap" style={{ color: '#16A34A' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
                <th>AKSI</th>
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
                    <td>
                      <button
                        onClick={() => cat.id !== undefined && openEditModal(cat.id, cat.name)}
                        title="Edit Kategori"
                        style={{
                          background: 'transparent',
                          color: '#64748B',
                          border: 'none',
                          width: '32px',
                          height: '32px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: '0.2s'
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="19" cy="12" r="1" />
                          <circle cx="5" cy="12" r="1" />
                        </svg>
                      </button>
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
      </div>

      {/* Modal Tambah/Edit Kategori */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#0F172A', fontWeight: 800 }}>
              {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
            <form onSubmit={handleSaveCategory}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kripik Tempe Pedas"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  style={{
                    width: '100%', height: '44px', padding: '0 16px', borderRadius: '10px',
                    border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px', color: '#0F172A',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1D4ED8'}
                  onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Yakin ingin menghapus kategori ini?')) {
                        deleteCategory(editingId);
                        setIsModalOpen(false);
                      }
                    }}
                    style={{
                      padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#EF4444',
                      color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', fontSize: '13.5px', marginRight: 'auto'
                    }}
                  >
                    Hapus
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#F1F5F9',
                    color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '13.5px'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#F59E0B',
                    color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', fontSize: '13.5px'
                  }}
                >
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

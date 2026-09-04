import React, { useState } from 'react';
import { useProducts, type ProductItem } from '../../../context/ProductContext';
import { useCategory } from '../../../context/CategoryContext';
import ImageCropperModal from './ImageCropperModal';
import Swal from 'sweetalert2';
import './ProductManager.css';

const ProductManager: React.FC = () => {
  const { products, updateProductStock, updateProductPrice, updateProduct, toggleProductStatus, addProduct, deleteProduct } = useProducts();
  const { categories } = useCategory();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductItem | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [editingStockId, setEditingStockId] = useState<number | null>(null);

  // Crop Modal state
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<'new' | 'edit' | null>(null);

  // Quick edit temp values
  const [tempPriceValue, setTempPriceValue] = useState('');
  const [tempStockValue, setTempStockValue] = useState('');

  // New product form state
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductFlavor, setNewProductFlavor] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductWeight, setNewProductWeight] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');

  // Filtered product list
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.flavor ? p.flavor.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();

    const currentStatus = p.stock === 0 ? 'habis' : (p.status === 'habis' ? 'aktif' : p.status);
    const matchStatus = statusFilter === 'all' || currentStatus === statusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const priceNum = parseInt(newProductPrice.replace(/[^0-9]/g, ''), 10) || 15000;
    const stockNum = parseInt(newProductStock.replace(/[^0-9]/g, ''), 10) || 0;
    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(priceNum);

    const selectedCat = categories.find(c => c.name === newProductCategory);
    const catId = selectedCat ? (selectedCat.id || selectedCat.id_category || 1) : 1;

    const success = await addProduct({
      name: newProductName,
      category: newProductCategory || 'Kripik Tempe',
      categoryId: catId,
      flavor: newProductFlavor,
      price: formattedPrice,
      priceNum: priceNum,
      priceStr: formattedPrice,
      stock: stockNum,
      weight: newProductWeight || '100 gram',
      status: stockNum === 0 ? 'habis' : 'aktif',
      label: 'Baru',
      image: (!newProductImage || newProductImage.startsWith('blob:')) ? '/images/products/flavor-original.png' : newProductImage,
      desc: newProductDesc || 'Produk olahan Kripik tempe Lakstari lezat & berkualitas.'
    });

    if (success) {
      setIsAddModalOpen(false);
      resetNewForm();
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Ditambahkan!',
        text: `Produk "${newProductName}" berhasil masuk ke katalog.`,
        timer: 1600,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menambahkan',
        text: 'Terjadi kendala saat menyimpan produk ke server.',
      });
    }
  };

  const resetNewForm = () => {
    setNewProductName('');
    setNewProductFlavor('');
    setNewProductPrice('');
    setNewProductStock('');
    setNewProductWeight('');
    setNewProductDesc('');
    setNewProductImage('');
    setNewProductCategory('');
  };

  // Handle Save Full Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    let finalCatId = editingProduct.categoryId;
    if (!finalCatId) {
      const selectedCat = categories.find(c => c.name === editingProduct.category);
      finalCatId = selectedCat ? selectedCat.id : 1;
    }

    const stockNum = Math.max(0, parseInt(editingProduct.stock as any, 10) || 0);
    const autoStatus = stockNum === 0 ? 'habis' : (editingProduct.status === 'habis' ? 'aktif' : editingProduct.status);

    const success = await updateProduct({ ...editingProduct, stock: stockNum, status: autoStatus, categoryId: finalCatId });
    setEditingProduct(null);

    if (success) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disimpan!',
        text: `Stok dan data produk "${editingProduct.name}" berhasil diperbarui.`,
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  // Quick Price Save
  const handleSavePriceEdit = (id: number) => {
    const val = parseInt(tempPriceValue.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(val) && val >= 0) {
      updateProductPrice(id, val);
    }
    setEditingPriceId(null);
  };

  // Quick Stock Save
  const handleSaveStockEdit = (id: number) => {
    const val = parseInt(tempStockValue.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(val)) {
      updateProductStock(id, val);
    }
    setEditingStockId(null);
  };

  // Delete product
  const handleDeleteProduct = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: 'Hapus Produk?',
      text: `Apakah Anda yakin ingin menghapus produk "${name}" dari katalog?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
      const ok = await deleteProduct(id);
      if (ok) {
        Swal.fire({
          icon: 'success',
          title: 'Terhapus!',
          text: `Produk "${name}" berhasil dihapus dari katalog.`,
          timer: 1600,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: 'Terjadi kendala saat menghapus produk dari server.',
        });
      }
    }
  };

  return (
    <div className="product-manager">
      {/* Header */}
      <div className="pm-header">
        <div>
          <h2>Manajemen Produk Kripik Tempe</h2>
          <p>Kelola katalog produk, stok barang, harga satuan, dan status publikasi secara real-time.</p>
        </div>
        <button className="add-product-btn" onClick={() => setIsAddModalOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Tambah Produk Baru
        </button>
      </div>

      {/* Product Table Card */}
      <div className="admin-card pm-card">
        {/* Filters Toolbar */}
        <div className="pm-filter-bar">
          <div className="pm-search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              placeholder="Cari berdasarkan nama, kategori, atau varian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="pm-select-group">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="all">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="habis">Habis (Stok 0)</option>
            </select>
          </div>
        </div>

        {/* PRD Table Columns: Foto | Nama Produk | Kategori | Harga | Stok | Berat | Status | Aksi */}
        <div className="table-responsive">
          <table className="admin-table pm-table">
            <thead>
              <tr>
                <th>PRODUK</th>
                <th>HARGA</th>
                <th>STOK</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'center' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                    Tidak ada produk yang cocok dengan pencarian / filter Anda.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product: ProductItem) => {
                  const currentStatus = product.stock === 0 ? 'habis' : (product.status === 'habis' ? 'aktif' : product.status);
                  return (
                    <tr key={product.id}>
                      {/* Produk (Foto + Nama + Rasa/Berat) */}
                      <td>
                        <div className="pm-compact-product">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="pm-compact-img"
                            onClick={() => setDetailProduct(product)}
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/flavor-original.png'; }}
                          />
                          <div className="pm-compact-info">
                            <span className="pm-compact-name" onClick={() => setDetailProduct(product)}>{product.name}</span>
                            <span className="pm-compact-desc">{product.flavor || product.category} • {product.weight || '100 gram'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Harga */}
                      <td>
                        {editingPriceId === product.id ? (
                          <div className="pm-inline-edit">
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Rp</span>
                            <input
                              type="text"
                              value={tempPriceValue}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/[^0-9]/g, '');
                                setTempPriceValue(raw ? parseInt(raw, 10).toLocaleString('id-ID') : '');
                              }}
                              autoFocus
                            />
                            <button className="pm-save-mini" onClick={() => product.id !== undefined && handleSavePriceEdit(product.id)}>Simpan</button>
                          </div>
                        ) : (
                          <span className="pm-compact-price">{product.priceStr}</span>
                        )}
                      </td>

                      {/* Stok */}
                      <td>
                        {editingStockId === product.id ? (
                          <div className="pm-inline-edit">
                            <input
                              type="text"
                              value={tempStockValue}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/[^0-9]/g, '');
                                setTempStockValue(raw ? parseInt(raw, 10).toLocaleString('id-ID') : '');
                              }}
                              autoFocus
                            />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>pcs</span>
                            <button className="pm-save-mini" onClick={() => product.id !== undefined && handleSaveStockEdit(product.id)}>Simpan</button>
                          </div>
                        ) : (
                          <span className="pm-compact-stock">{product.stock} pcs</span>
                        )}
                      </td>

                      {/* Status (aktif / nonaktif / habis) — Toggle Switch */}
                      <td>
                        {currentStatus === 'habis' ? (
                          <span className="st-habis" title="Stok habis">Habis</span>
                        ) : (
                          <label className="pm-toggle-switch" title="Klik untuk ubah status aktif/nonaktif">
                            <input
                              type="checkbox"
                              checked={currentStatus === 'aktif'}
                              onChange={() => product.id !== undefined && toggleProductStatus(product.id)}
                            />
                            <span className="pm-toggle-slider"></span>
                            <span className="pm-toggle-label">{currentStatus === 'aktif' ? 'Aktif' : 'Nonaktif'}</span>
                          </label>
                        )}
                      </td>

                      {/* Aksi (3 Dots Menu) */}
                      <td style={{ textAlign: 'center', position: 'relative' }}>
                        <button
                          className="pm-dots-btn"
                          onClick={() => setActiveMenuId(activeMenuId === product.id ? null : (product.id ?? null))}
                        >
                          ⋮
                        </button>

                        {activeMenuId === product.id && (
                          <React.Fragment>
                            <div className="pm-dropdown-overlay" onClick={() => setActiveMenuId(null)}></div>
                            <div className="pm-action-dropdown">

                              <button onClick={() => { setEditingProduct({ ...product }); setActiveMenuId(null); }}>
                                Edit Produk
                              </button>

                              <button className="danger" onClick={() => { if (product.id !== undefined) handleDeleteProduct(product.id, product.name); setActiveMenuId(null); }}>
                                Hapus Produk
                              </button>
                            </div>
                          </React.Fragment>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Product Cards (Visible on mobile <= 768px, No Horizontal Scroll) */}
        <div className="pm-mobile-card-list">
          {filteredProducts.length === 0 ? (
            <div className="pm-mob-empty">
              Tidak ada produk yang cocok dengan pencarian / filter Anda.
            </div>
          ) : (
            filteredProducts.map((product: ProductItem) => {
              const currentStatus = product.stock === 0 ? 'habis' : (product.status === 'habis' ? 'aktif' : product.status);
              return (
                <div key={product.id} className="pm-mob-card">
                  {/* Top: Image, Name, Badge, and Action Button */}
                  <div className="pm-mob-card-header">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="pm-mob-img"
                      onClick={() => setDetailProduct(product)}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/flavor-original.png'; }}
                    />
                    <div className="pm-mob-info" onClick={() => setDetailProduct(product)}>
                      <span className="pm-mob-name">{product.name}</span>
                      <div className="pm-mob-meta">
                        <span className="pm-mob-cat">{product.category}</span>
                        <span className="pm-mob-dot">•</span>
                        <span>{product.flavor || 'Original'}</span>
                        <span className="pm-mob-dot">•</span>
                        <span>{product.weight || '100 gram'}</span>
                      </div>
                    </div>

                    <div className="pm-mob-action-wrap">
                      {/* Status Toggle in Header */}
                      {currentStatus === 'habis' ? (
                        <span className="st-habis pm-mob-status-pill" title="Stok habis">Habis</span>
                      ) : (
                        <label className="pm-mob-status-toggle" title="Klik untuk ubah status produk">
                          <input
                            type="checkbox"
                            checked={currentStatus === 'aktif'}
                            onChange={() => product.id !== undefined && toggleProductStatus(product.id)}
                          />
                          <span className={`pm-mob-status-pill ${currentStatus === 'aktif' ? 'is-active' : 'is-inactive'}`}>
                            <span className="pm-mob-status-dot"></span>
                            <span>{currentStatus === 'aktif' ? 'Aktif' : 'Nonaktif'}</span>
                          </span>
                        </label>
                      )}

                      <button
                        className="pm-dots-btn"
                        onClick={() => setActiveMenuId(activeMenuId === product.id ? null : (product.id ?? null))}
                        aria-label="Menu Opsi"
                      >
                        ⋮
                      </button>

                      {activeMenuId === product.id && (
                        <React.Fragment>
                          <div className="pm-dropdown-overlay" onClick={() => setActiveMenuId(null)}></div>
                          <div className="pm-action-dropdown pm-mob-dropdown">
                            <button onClick={() => { setEditingProduct({ ...product }); setActiveMenuId(null); }}>
                              Edit Produk
                            </button>
                            <button className="danger" onClick={() => { if (product.id !== undefined) handleDeleteProduct(product.id, product.name); setActiveMenuId(null); }}>
                              Hapus Produk
                            </button>
                          </div>
                        </React.Fragment>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="pm-mob-divider" />

                  {/* Bottom: Price and Stock */}
                  <div className="pm-mob-card-footer">
                    {/* Price */}
                    <div className="pm-mob-col">
                      <span className="pm-mob-label">Harga Satuan</span>
                      <span className="pm-mob-val price">{product.priceStr}</span>
                    </div>

                    {/* Stock */}
                    <div className="pm-mob-col stock">
                      <span className="pm-mob-label">Stok Tersedia</span>
                      <span className={`pm-mob-val ${product.stock === 0 ? 'text-red' : ''}`}>
                        {product.stock} pcs
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ══ MODAL TAMBAH PRODUK ══ */}
      {isAddModalOpen && (
        <div className="pm-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="pm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tambah Produk Baru</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleAddProduct} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nama Produk</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kripik Tempe Original"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Kategori (Opsional)</label>
                  <select value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)}>
                    <option value="">Pilih Kategori (Lewati jika belum ada)</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Varian Rasa</label>
                  <input
                    type="text"
                    placeholder="Contoh: Original"
                    value={newProductFlavor}
                    onChange={(e) => setNewProductFlavor(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Berat Produk</label>
                  <input
                    type="text"
                    placeholder="Contoh: 100 gram"
                    value={newProductWeight}
                    onChange={(e) => setNewProductWeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Harga (Rp)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 15.000"
                    value={newProductPrice}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setNewProductPrice(raw ? parseInt(raw, 10).toLocaleString('id-ID') : '');
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Stok Awal</label>
                  <input
                    type="text"
                    placeholder="Contoh: 100"
                    value={newProductStock}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setNewProductStock(raw ? parseInt(raw, 10).toLocaleString('id-ID') : '');
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Upload Foto Produk</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const fileUrl = URL.createObjectURL(e.target.files[0]);
                      setCropImageSrc(fileUrl);
                      setCropTarget('new');
                    }
                  }}
                />
                <div className="pm-img-preview-container">
                  {newProductImage && (
                    <img src={newProductImage} alt="Preview" />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Deskripsi Produk</label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan singkat rasa & keunggulan produk..."
                  value={newProductDesc}
                  onChange={e => setNewProductDesc(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsAddModalOpen(false)}>Batal</button>
                <button type="submit" className="save-btn">Simpan Produk</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL EDIT PRODUK LENGKAP ══ */}
      {editingProduct && (
        <div className="pm-modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="pm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Produk #{editingProduct.id}</h3>
              <button className="modal-close-btn" onClick={() => setEditingProduct(null)}>&times;</button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nama Produk</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Kategori</label>
                  <select
                    value={editingProduct.category}
                    onChange={e => {
                      const selectedCat = categories.find(c => c.name === e.target.value);
                      setEditingProduct({ 
                        ...editingProduct, 
                        category: e.target.value,
                        categoryId: selectedCat ? selectedCat.id : 1
                      });
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Varian Rasa</label>
                  <input
                    type="text"
                    value={editingProduct.flavor}
                    onChange={(e) => setEditingProduct({ ...editingProduct, flavor: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Berat Produk</label>
                  <input
                    type="text"
                    value={editingProduct.weight}
                    onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Harga (Rp)</label>
                  <input
                    type="text"
                    value={editingProduct.priceNum ? editingProduct.priceNum.toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setEditingProduct({ ...editingProduct, priceNum: raw ? parseInt(raw, 10) : 0 });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Stok Barang</label>
                  <input
                    type="text"
                    value={editingProduct.stock !== undefined ? editingProduct.stock : 0}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setEditingProduct({ ...editingProduct, stock: raw ? parseInt(raw, 10) : 0 });
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Upload Foto Produk</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const fileUrl = URL.createObjectURL(e.target.files[0]);
                      setCropImageSrc(fileUrl);
                      setCropTarget('edit');
                    }
                  }}
                />
                <div className="pm-img-preview-container">
                  {editingProduct.image && (
                    <img src={editingProduct.image} alt="Preview" />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Deskripsi Produk</label>
                <textarea
                  rows={3}
                  value={editingProduct.desc}
                  onChange={e => setEditingProduct({ ...editingProduct, desc: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setEditingProduct(null)}>Batal</button>
                <button type="submit" className="save-btn">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL DETAIL PRODUK ══ */}
      {detailProduct && (
        <div className="pm-modal-overlay" onClick={() => setDetailProduct(null)}>
          <div className="pm-modal-box pm-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rincian Detail Produk</h3>
              <button className="modal-close-btn" onClick={() => setDetailProduct(null)}>&times;</button>
            </div>

            <div className="pm-detail-content">
              <div className="pm-detail-image">
                <img
                  src={detailProduct.image}
                  alt={detailProduct.name}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/flavor-original.png'; }}
                />
              </div>

              <div className="pm-detail-info">
                <h4>{detailProduct.name}</h4>
                <div className="pm-detail-badge-group">
                  <span className="pm-category-badge">{detailProduct.category}</span>
                  {(() => {
                    const currentDetailStatus = detailProduct.stock === 0 ? 'habis' : (detailProduct.status === 'habis' ? 'aktif' : detailProduct.status);
                    return (
                      <span className={`pm-status-pill st-${currentDetailStatus}`}>
                        {currentDetailStatus === 'habis' ? 'Habis' : currentDetailStatus === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    );
                  })()}
                </div>

                <div className="pm-detail-grid">
                  <div>
                    <label>Harga Satuan</label>
                    <strong>{detailProduct.priceStr}</strong>
                  </div>
                  <div>
                    <label>Stok Tersedia</label>
                    <strong>{detailProduct.stock} pcs</strong>
                  </div>
                  <div>
                    <label>Berat Bersih</label>
                    <strong>{detailProduct.weight || '100 gram'}</strong>
                  </div>
                  <div>
                    <label>Varian Rasa</label>
                    <strong>{detailProduct.flavor}</strong>
                  </div>
                </div>

                <div className="pm-detail-desc">
                  <label>Deskripsi Produk</label>
                  <p>{detailProduct.desc || 'Belum ada deskripsi untuk produk ini.'}</p>
                </div>
              </div>
            </div>

            <div className="modal-actions pm-detail-actions">
              <button type="button" className="save-btn" onClick={() => setDetailProduct(null)}>Tutup Detail</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Crop Gambar */}
      {cropImageSrc && cropTarget && (
        <ImageCropperModal
          imageSrc={cropImageSrc}
          onCropComplete={(base64) => {
            if (cropTarget === 'new') {
              setNewProductImage(base64);
            } else if (cropTarget === 'edit' && editingProduct) {
              setEditingProduct({ ...editingProduct, image: base64 });
            }
            setCropImageSrc(null);
            setCropTarget(null);
          }}
          onCancel={() => {
            setCropImageSrc(null);
            setCropTarget(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductManager;

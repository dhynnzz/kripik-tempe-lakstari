import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiService } from '../services/api';

export interface ProductItem {
  id_product?: number; // Backend DB ID
  id?: number;         // Frontend backward compatibility
  name: string;
  category: string;
  categoryId?: number;
  flavor?: string;
  price?: string;
  priceNum: number;
  priceStr?: string;
  stock: number;
  weight?: string;
  status: 'aktif' | 'nonaktif' | 'habis';
  label?: string;
  image?: string;
  desc?: string;
  // Field dari backend:
  nama_product?: string;
  harga_product?: string;
  stok_product?: number;
  berat_product?: number;
  deskripsi_product?: string;
  foto_product?: string;
  status_product?: 'aktif' | 'nonaktif' | 'habis';
}

interface ProductContextType {
  products: ProductItem[];
  updateProductStock: (id: number, newStock: number) => void;
  updateProductPrice: (id: number, newPrice: number) => void;
  updateProduct: (updated: ProductItem) => void;
  toggleProductStatus: (id: number) => void;
  addProduct: (product: Omit<ProductItem, 'id'>) => void;
  deleteProduct: (id: number) => void;
  updateProductsCategory: (oldCat: string, newCat: string) => void;
  refreshProducts: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);

  const fetchProducts = async () => {
    try {
      const rawProducts = await apiService.getProducts();
      // Map data backend ke format frontend
      const formatted = rawProducts.map((p: any) => {
        const stock = parseInt(p.stok_product, 10) || 0;
        let computedStatus: 'aktif' | 'nonaktif' | 'habis' = p.status_product || 'aktif';
        if (stock === 0) {
          computedStatus = 'habis';
        } else if (computedStatus === 'habis' && stock > 0) {
          computedStatus = 'aktif';
        }

        return {
          id: p.id_product,
          name: p.nama_product,
          category: p.category ? p.category.nama_category : 'Lainnya',
          flavor: p.nama_product,
          priceNum: parseFloat(p.harga_product),
          priceStr: `Rp ${parseFloat(p.harga_product).toLocaleString('id-ID')}`,
          stock: stock,
          weight: `${p.berat_product} gram`,
          status: computedStatus,
          desc: p.deskripsi_product,
          image: (!p.foto_product || p.foto_product.startsWith('blob:')) ? '/flavor_original_1786524783436.png' : p.foto_product
        };
      });
      setProducts(formatted);
    } catch (error) {
      console.error('Gagal mengambil data produk:', error);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Auto-sync data ketika pengguna kembali membuka tab ini (Refresh on Focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProducts();
      }
    };
    
    const handleFocus = () => {
      fetchProducts();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const refreshProducts = () => {
    fetchProducts();
  };

  const updateProductStock = async (id: number, newStock: number) => {
    const finalStock = Math.max(0, newStock);
    
    // Optimistic UI update
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newStatus = finalStock === 0 ? 'habis' : (p.status === 'habis' ? 'aktif' : p.status);
        return { ...p, stock: finalStock, status: newStatus };
      }
      return p;
    }));
    await apiService.updateProductStock(id, finalStock);
    fetchProducts();
  };

  const updateProductPrice = async (id: number, newPrice: number) => {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    const success = await apiService.updateProduct(id, { ...p, priceNum: newPrice });
    if (success) fetchProducts();
  };

  const toggleProductStatus = async (id: number) => {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    if (p.stock === 0) return; // Tidak bisa aktif jika stok 0
    const currentSt = (p.status === 'habis' && p.stock > 0) ? 'aktif' : p.status;
    const nextStatus = currentSt === 'aktif' ? 'nonaktif' : 'aktif';
    const success = await apiService.updateProduct(id, { ...p, status: nextStatus });
    if (success) fetchProducts();
  };

  const updateProduct = async (updated: ProductItem) => {
    const stock = Math.max(0, updated.stock);
    const autoStatus = stock === 0 ? 'habis' : (updated.status === 'habis' ? 'aktif' : updated.status);
    const payload = { ...updated, stock, status: autoStatus };
    const success = await apiService.updateProduct(updated.id, payload);
    if (success) fetchProducts();
  };

  const addProduct = async (productData: Omit<ProductItem, 'id'>) => {
    const added = await apiService.addProduct(productData);
    if (added) fetchProducts();
  };

  const deleteProduct = async (id: number) => {
    const success = await apiService.deleteProduct(id);
    if (success) fetchProducts();
  };

  const updateProductsCategory = async (oldCat: string, newCat: string) => {
    setProducts(prev => prev.map(p => {
      if (p.category.toLowerCase() === oldCat.toLowerCase()) {
        return { ...p, category: newCat };
      }
      return p;
    }));
  };

  return (
    <ProductContext.Provider value={{ products, updateProductStock, updateProductPrice, updateProduct, toggleProductStatus, addProduct, deleteProduct, updateProductsCategory, refreshProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

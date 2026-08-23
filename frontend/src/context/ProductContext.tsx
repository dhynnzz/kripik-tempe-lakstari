import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
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

export const normalizeProductImage = (img?: string): string => {
  if (!img || img.startsWith('blob:')) return '/images/products/flavor-original.png';
  
  // Fix for corrupted database entries that prepended /images/products/ to /storage/
  if (img.startsWith('/images/products/storage/')) {
    img = img.replace('/images/products/storage/', '/storage/');
  }

  if (img.startsWith('data:') || img.startsWith('http://') || img.startsWith('https://')) return img;
  
  if (img.startsWith('/storage/')) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:8000';
    return `${baseUrl}${img}`;
  }

  if (img.startsWith('/images/')) return img;

  const filename = img.replace(/^\//, '').toLowerCase();
  if (filename.includes('original')) return '/images/products/flavor-original.png';
  if (filename.includes('pedas_manis') || filename.includes('pedas-manis')) return '/images/products/flavor-pedas-manis.png';
  if (filename.includes('balado')) return '/images/products/flavor-balado.png';
  if (filename.includes('bbq')) return '/images/products/flavor-bbq.png';
  if (filename.includes('keju')) return '/images/products/flavor-keju.png';
  if (filename.includes('jagung')) return '/images/products/flavor-jagung-bakar.png';
  if (filename.includes('sapi')) return '/images/products/flavor-sapi-panggang.png';
  if (filename.includes('daun_jeruk') || filename.includes('jeruk')) return '/images/products/flavor-daun-jeruk.png';
  if (filename.includes('paket_4') || filename.includes('paket-4') || filename.includes('hemat')) return '/images/products/paket-4-hemat.png';
  if (filename.includes('paket_5') || filename.includes('paket-5') || filename.includes('lengkap')) return '/images/products/paket-5-lengkap.png';

  return `/images/products/${filename}`;
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);

  const fetchProducts = async () => {
    try {
      const rawProducts = await apiService.getProducts();
      // Map data backend ke format frontend
      const productsArray = rawProducts.data ? rawProducts.data : rawProducts;
      const formatted = productsArray.map((p: any) => {
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
          categoryId: p.id_category,
          flavor: p.varian_rasa || '',
          priceNum: parseFloat(p.harga_product),
          priceStr: `Rp ${parseFloat(p.harga_product).toLocaleString('id-ID')}`,
          stock: stock,
          weight: `${p.berat_product} gram`,
          status: computedStatus,
          desc: p.deskripsi_product,
          image: normalizeProductImage(p.foto_product)
        };
      });
      setProducts(formatted);
    } catch (error) {
      console.error('Gagal mengambil data produk:', error);
    }
  };
  const lastFetchTime = useRef<number>(0);

  const fetchProductsThrottled = () => {
    const now = Date.now();
    // Jika fetch terakhir kurang dari 10 detik yang lalu, jangan fetch lagi
    if (now - lastFetchTime.current > 10000) {
      lastFetchTime.current = now;
      fetchProducts();
    }
  };

  useEffect(() => {
    fetchProducts();
    lastFetchTime.current = Date.now();

    // Auto-sync data ketika pengguna kembali membuka tab ini (Refresh on Focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProductsThrottled();
      }
    };
    
    const handleFocus = () => {
      fetchProductsThrottled();
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
  };

  const updateProductPrice = async (id: number, newPrice: number) => {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    setProducts(prev => prev.map(item => item.id === id ? { ...item, priceNum: newPrice, priceStr: `Rp ${newPrice.toLocaleString('id-ID')}` } : item));
    await apiService.updateProduct(id, { harga_product: newPrice });
  };

  const toggleProductStatus = async (id: number) => {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    if (p.stock === 0) return; // Tidak bisa aktif jika stok 0
    const currentSt = (p.status === 'habis' && p.stock > 0) ? 'aktif' : p.status;
    const nextStatus = currentSt === 'aktif' ? 'nonaktif' : 'aktif';
    
    // ⚡ Optimistic UI Update: langsung update state tanpa flicker
    setProducts(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item));

    const success = await apiService.updateProduct(id, { status_product: nextStatus });
    if (!success) {
      // Revert jika gagal ke server
      setProducts(prev => prev.map(item => item.id === id ? { ...item, status: currentSt } : item));
    }
  };

  const updateProduct = async (updated: ProductItem) => {
    const stock = Math.max(0, updated.stock);
    const autoStatus = stock === 0 ? 'habis' : (updated.status === 'habis' ? 'aktif' : updated.status);
    const payload = { ...updated, stock, status: autoStatus };
    if (updated.id !== undefined) {
      const success = await apiService.updateProduct(updated.id, payload);
      if (success) fetchProducts();
    }
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

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
  updateProduct: (updated: ProductItem) => Promise<boolean>;
  toggleProductStatus: (id: number) => void;
  addProduct: (product: Omit<ProductItem, 'id'>) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  updateProductsCategory: (oldCat: string, newCat: string) => void;
  refreshProducts: () => void;
  isLoadingProducts: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const normalizeProductImage = (img?: string): string => {
  if (!img || typeof img !== 'string' || img.startsWith('blob:')) {
    return '/images/products/flavor-original.png';
  }

  let cleanImg = img.trim();
  const lowerImg = cleanImg.toLowerCase();

  // Jika nama gambar atau path mengandung kata 'placeholder' atau korup
  if (lowerImg.includes('placeholder')) {
    return '/images/products/flavor-original.png';
  }

  // Perbaikan entri rusak di DB yang menempelkan /images/products/ ke depan /storage/
  if (cleanImg.startsWith('/images/products/storage/')) {
    cleanImg = cleanImg.replace('/images/products/storage/', '/storage/');
  }

  // Jika sudah merupakan data URL atau remote URL lengkap
  if (cleanImg.startsWith('data:') || cleanImg.startsWith('http://') || cleanImg.startsWith('https://')) {
    return cleanImg;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:8000';

  // Jika merupakan file di Laravel storage: /storage/... atau storage/...
  if (cleanImg.startsWith('/storage/') || cleanImg.startsWith('storage/')) {
    const storagePath = cleanImg.startsWith('/') ? cleanImg : `/${cleanImg}`;
    return `${baseUrl}${storagePath}`;
  }

  // Cek pencocokan varian rasa statis terlebih dahulu
  if (lowerImg.includes('original')) return '/images/products/flavor-original.png';
  if (lowerImg.includes('daun_jeruk') || lowerImg.includes('daun-jeruk') || lowerImg.includes('jeruk')) return '/images/products/flavor-daun-jeruk.png';
  if (lowerImg.includes('balado')) return '/images/products/flavor-balado.png';
  if (lowerImg.includes('bbq')) return '/images/products/flavor-bbq.png';
  if (lowerImg.includes('keju')) return '/images/products/flavor-keju.png';
  if (lowerImg.includes('jagung')) return '/images/products/flavor-jagung-bakar.png';
  if (lowerImg.includes('sapi')) return '/images/products/flavor-sapi-panggang.png';
  if (lowerImg.includes('pedas') || lowerImg.includes('manis')) return '/images/products/flavor-pedas-manis.png';
  if (lowerImg.includes('paket_4') || lowerImg.includes('paket-4') || lowerImg.includes('hemat')) return '/images/products/paket-4-hemat.png';
  if (lowerImg.includes('paket_5') || lowerImg.includes('paket-5') || lowerImg.includes('lengkap') || lowerImg.includes('jumbo')) return '/images/products/paket-5-lengkap.png';

  // Jika merupakan file upload Laravel yang disimpan sebagai "products/xxx.ext"
  if (cleanImg.startsWith('products/') || cleanImg.startsWith('/products/')) {
    const relPath = cleanImg.startsWith('/') ? cleanImg.slice(1) : cleanImg;
    return `${baseUrl}/storage/${relPath}`;
  }

  // Jika sudah mengarah ke file statis /images/products/...
  if (cleanImg.startsWith('/images/products/flavor-') || cleanImg.startsWith('/images/products/paket-')) {
    return cleanImg;
  }

  if (cleanImg.startsWith('/images/')) {
    return cleanImg;
  }

  // Default fallback aman ke foto original daripada menghasilkan URL 404 rusak
  return '/images/products/flavor-original.png';
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const fetchProducts = async (showLoading = false) => {
    if (showLoading) {
      setIsLoadingProducts(true);
    }
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
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    // Hanya fetch sekali saat komponen di-mount dengan loading skeleton awal
    fetchProducts(true);
  }, []);

  const refreshProducts = () => {
    // Background update tanpa mereset UI atau menampilkan skeleton loading
    fetchProducts(false);
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

  const updateProduct = async (updated: ProductItem): Promise<boolean> => {
    const stock = Math.max(0, updated.stock);
    const autoStatus: 'aktif' | 'nonaktif' | 'habis' = stock === 0 ? 'habis' : (updated.status === 'habis' ? 'aktif' : (updated.status || 'aktif'));
    const payload: ProductItem = { ...updated, stock, status: autoStatus };

    // Optimistic UI Update: langsung perbarui state di frontend tanpa jeda
    setProducts(prev => prev.map(p => p.id === updated.id ? {
      ...p,
      ...payload,
      priceStr: `Rp ${payload.priceNum.toLocaleString('id-ID')}`
    } : p));

    if (updated.id !== undefined) {
      const success = await apiService.updateProduct(updated.id, payload);
      if (success) {
        await fetchProducts();
        return true;
      } else {
        await fetchProducts();
        return false;
      }
    }
    return false;
  };

  const addProduct = async (productData: Omit<ProductItem, 'id'>): Promise<boolean> => {
    const added = await apiService.addProduct(productData);
    if (added) {
      await fetchProducts();
      return true;
    }
    return false;
  };

  const deleteProduct = async (id: number): Promise<boolean> => {
    // Optimistic UI Update: langsung singkirkan produk dari UI agar instan
    const previous = [...products];
    setProducts(prev => prev.filter(p => p.id !== id));

    const success = await apiService.deleteProduct(id);
    if (success) {
      await fetchProducts();
      return true;
    } else {
      // Revert jika gagal di server
      setProducts(previous);
      return false;
    }
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
    <ProductContext.Provider value={{ products, updateProductStock, updateProductPrice, updateProduct, toggleProductStatus, addProduct, deleteProduct, updateProductsCategory, refreshProducts, isLoadingProducts }}>
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

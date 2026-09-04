import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiService } from '../services/api';

export interface CategoryItem {
  id_category?: number;
  id?: number;
  name: string;
  nama_category?: string;
  status: 'aktif' | 'nonaktif';
  status_category?: 'aktif' | 'nonaktif';
  products_count?: number;
}

interface CategoryContextType {
  categories: CategoryItem[];
  addCategory: (name: string) => Promise<{ success: boolean; message?: string }>;
  updateCategory: (id: number, name: string) => Promise<{ success: boolean; message?: string }>;
  deleteCategory: (id: number) => Promise<{ success: boolean; message?: string }>;
  toggleCategoryStatus: (id: number) => Promise<boolean>;
  refreshCategories: () => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const fetchCategories = async () => {
    try {
      const res: any = await apiService.getCategories();
      const rawList: any[] = Array.isArray(res) ? res : (res?.data || []);
      const formatted = rawList.map((c: any) => ({
        id: c.id_category,
        id_category: c.id_category,
        name: c.nama_category,
        nama_category: c.nama_category,
        status: c.status_category || 'aktif',
        status_category: c.status_category || 'aktif',
        products_count: c.products_count ?? 0
      }));
      setCategories(formatted);
    } catch (err) {
      console.error('Gagal mengambil kategori:', err);
    }
  };

  useEffect(() => {
    fetchCategories();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCategories();
      }
    };
    
    const handleFocus = () => {
      fetchCategories();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const refreshCategories = () => {
    fetchCategories();
  };

  const addCategory = async (name: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiService.addCategory(name);
    if (res.success) {
      await fetchCategories();
    }
    return res;
  };

  const updateCategory = async (id: number, name: string): Promise<{ success: boolean; message?: string }> => {
    // Optimistic UI update
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name, nama_category: name } : c));
    const res = await apiService.updateCategory(id, { nama_category: name });
    if (res.success) {
      await fetchCategories();
    } else {
      await fetchCategories();
    }
    return res;
  };

  const deleteCategory = async (id: number): Promise<{ success: boolean; message?: string }> => {
    const previous = [...categories];
    // Optimistic UI update
    setCategories(prev => prev.filter(c => c.id !== id));

    const res = await apiService.deleteCategory(id);
    if (res.success) {
      await fetchCategories();
    } else {
      // Revert if server rejected (e.g., category has products)
      setCategories(previous);
    }
    return res;
  };

  const toggleCategoryStatus = async (id: number): Promise<boolean> => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return false;
    const newStatus: 'aktif' | 'nonaktif' = cat.status === 'aktif' ? 'nonaktif' : 'aktif';
    
    // Optimistic UI Update
    setCategories(prev => prev.map(c => c.id === id ? { ...c, status: newStatus, status_category: newStatus } : c));

    const res = await apiService.updateCategory(id, { status_category: newStatus });
    if (!res.success) {
      // Revert
      setCategories(prev => prev.map(c => c.id === id ? { ...c, status: cat.status, status_category: cat.status } : c));
      return false;
    }
    return true;
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, toggleCategoryStatus, refreshCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};

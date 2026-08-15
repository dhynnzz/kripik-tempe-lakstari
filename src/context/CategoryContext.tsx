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
  addCategory: (name: string) => void;
  updateCategory: (id: number, name: string) => void;
  deleteCategory: (id: number) => void;
  toggleCategoryStatus: (id: number) => void;
  refreshCategories: () => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const fetchCategories = async () => {
    try {
      // Kita perlu tambahkan getCategories di api.ts jika belum ada, atau panggil fetch langsung
      const response = await fetch('http://localhost:8000/api/categories');
      if (response.ok) {
        const data = await response.json();
        const formatted = data.map((c: any) => ({
          id: c.id_category,
          name: c.nama_category,
          status: c.status_category,
          products_count: c.products_count
        }));
        setCategories(formatted);
      }
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

  const addCategory = async (name: string) => {
    const success = await apiService.addCategory(name);
    if (success) fetchCategories();
  };

  const updateCategory = async (id: number, name: string) => {
    const success = await apiService.updateCategory(id, { nama_category: name });
    if (success) fetchCategories();
  };

  const deleteCategory = async (id: number) => {
    const success = await apiService.deleteCategory(id);
    if (success) fetchCategories();
  };

  const toggleCategoryStatus = async (id: number) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    const newStatus = cat.status === 'aktif' ? 'nonaktif' : 'aktif';
    const success = await apiService.updateCategory(id, { status_category: newStatus });
    if (success) fetchCategories();
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

/**
 * FRONTEND API CLIENT SERVICE (`src/services/api.ts`)
 * ====================================================
 * File ini bertugas sebagai penghubung (*bridge*) antara Frontend React dan Backend Server.
 * Semua pemanggilan HTTP Request (fetch) ke server backend berpusat di sini.
 */

import type { ProductItem } from '../context/ProductContext';

const API_BASE_URL = 'http://localhost:8000/api';

// Token dipanggil secara dinamis dari Session Storage saat Admin berhasil login di Server
const getAdminToken = () => {
  const token = sessionStorage.getItem('admin_token') || '';
  return `Bearer ${token}`;
};

export const apiService = {
  // 0. Autentikasi Login Admin ke Laravel Backend
  loginAdmin: async (email: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || 'Login gagal, pastikan kredensial benar.');
      }
      
      if (json.success && json.token) {
        sessionStorage.setItem('admin_token', json.token);
        sessionStorage.setItem('admin_user', JSON.stringify(json.user));
      }
      return json;
    } catch (error: any) {
      console.error('Login Error:', error);
      return { success: false, message: error.message || 'Terjadi kesalahan jaringan atau server.' };
    }
  },

  // Logout Admin
  logoutAdmin: async (): Promise<boolean> => {
    try {
      await fetch(`${API_BASE_URL}/admin/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': getAdminToken()
        }
      });
    } catch (err) {
      console.warn('Logout server bypass');
    } finally {
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_user');
    }
    return true;
  },

  // 1. Ambil Semua Produk & Stok Real-Time dari Server Backend
  getProducts: async (): Promise<ProductItem[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('Gagal mengambil data dari server');
      const json = await response.json();
      return json; // Backend returns the array directly
    } catch (error) {
      console.error('Koneksi ke Laravel server gagal:', error);
      return [];
    }
  },

  // 2. Admin Mengubah Stok Produk ke Laravel Backend (Aman & Terverifikasi Sanctum)
  updateProductStock: async (id: number, stock: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': getAdminToken()
        },
        body: JSON.stringify({ stock })
      });
      const json = await response.json();
      return json.success;
    } catch (error) {
      console.error('Error memperbarui stok ke Laravel server:', error);
      return false;
    }
  },

  // 3. Admin Menambah Produk Baru ke Laravel Backend
  addProduct: async (product: any): Promise<any> => {
    try {
      // Mapping ke field backend Laravel
      const payload = {
         id_category: product.category === 'Lainnya' ? 2 : 1, // fallback default jika tidak ada
         nama_product: product.name,
         deskripsi_product: product.desc || 'Deskripsi Produk',
         harga_product: product.priceNum,
         stok_product: product.stock,
         berat_product: parseInt(product.weight) || 100,
         foto_product: product.image || '/flavor_original_1786524783436.png',
         status_product: product.status || 'aktif'
      };

      // Idealnya mencari id_category berdasarkan nama category yang di passing
      if (product.categoryId) {
          payload.id_category = product.categoryId;
      }

      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': getAdminToken()
        },
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      return json.success ? json.data : null;
    } catch (error) {
      console.error('Error menambah produk ke Laravel server:', error);
      return null;
    }
  },

  // 4. Admin Menghapus Produk dari Laravel Backend
  deleteProduct: async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': getAdminToken()
        }
      });
      const json = await response.json();
      return json.success;
    } catch (error) {
      console.error('Error menghapus produk di server:', error);
      return false;
    }
  },

  // 5. Admin Mengupdate Produk Penuh
  updateProduct: async (id: number, product: any): Promise<boolean> => {
    try {
      const payload = {
         id_category: product.category === 'Lainnya' ? 2 : 1,
         nama_product: product.name,
         deskripsi_product: product.desc || 'Deskripsi Produk',
         harga_product: product.priceNum,
         stok_product: product.stock,
         berat_product: parseInt(product.weight) || 100,
         foto_product: product.image || '/flavor_original_1786524783436.png',
         status_product: product.status || 'aktif'
      };

      if (product.categoryId) {
          payload.id_category = product.categoryId;
      }

      const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': getAdminToken()
        },
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      return json.success;
    } catch (error) {
      console.error('Error update produk di server:', error);
      return false;
    }
  },

  // ================= CATEGORY API =================

  addCategory: async (nama_category: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': getAdminToken()
        },
        body: JSON.stringify({ nama_category, status_category: 'aktif' })
      });
      const json = await response.json();
      return json.success;
    } catch (error) {
      console.error('Error menambah kategori di server:', error);
      return false;
    }
  },

  updateCategory: async (id: number, data: any): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': getAdminToken()
        },
        body: JSON.stringify(data)
      });
      const json = await response.json();
      return json.success;
    } catch (error) {
      console.error('Error update kategori di server:', error);
      return false;
    }
  },

  deleteCategory: async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': getAdminToken()
        }
      });
      const json = await response.json();
      return json.success;
    } catch (error) {
      console.error('Error hapus kategori di server:', error);
      return false;
    }
  },

  // ================= ORDER / CHECKOUT API =================

  checkout: async (checkoutData: any): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(checkoutData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error checkout:', error);
      return { success: false, message: 'Gagal terhubung ke server.' };
    }
  },

  getOrders: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders`, {
        headers: { 'Accept': 'application/json', 'Authorization': getAdminToken() }
      });
      const json = await response.json();
      return json.success ? json.data : [];
    } catch (error) {
      console.error('Error get orders:', error);
      return [];
    }
  },

  updateOrderStatus: async (id: number, data: any): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': getAdminToken() },
        body: JSON.stringify(data)
      });
      const json = await response.json();
      return json.success;
    } catch (error) {
      console.error('Error update order status:', error);
      return false;
    }
  },

  // ================= CUSTOMERS API =================

  getCustomers: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/customers`, {
        headers: { 'Accept': 'application/json', 'Authorization': getAdminToken() }
      });
      const json = await response.json();
      return json.success ? json.data : [];
    } catch (error) {
      console.error('Error get customers:', error);
      return [];
    }
  },

  updateCustomerStatus: async (id: number, status_pelanggan: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': getAdminToken() },
        body: JSON.stringify({ status_pelanggan })
      });
      const json = await response.json();
      return json.success;
    } catch (error) {
      console.error('Error update customer status:', error);
      return false;
    }
  },

  // ================= SHIPMENTS API =================

  getShipments: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/shipments`, {
        headers: { 'Accept': 'application/json', 'Authorization': getAdminToken() }
      });
      const json = await response.json();
      return json.success ? json.data : [];
    } catch (error) {
      console.error('Error get shipments:', error);
      return [];
    }
  },

  updateShipment: async (id: number, data: any): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': getAdminToken() },
        body: JSON.stringify(data)
      });
      const json = await response.json();
      return json.success;
    } catch (error) {
      console.error('Error update shipment:', error);
      return false;
    }
  },

  // ================= REPORTS API =================

  getDashboardStats: async (): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/dashboard`, {
        headers: { 'Accept': 'application/json', 'Authorization': getAdminToken() }
      });
      const json = await response.json();
      return json.success ? json.data : null;
    } catch (error) {
      console.error('Error get dashboard stats:', error);
      return null;
    }
  },

  // ================= ADMIN ACCOUNTS API =================

  getAdmins: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/accounts`, {
        headers: { 'Accept': 'application/json', 'Authorization': getAdminToken() }
      });
      const json = await response.json();
      return json.success ? json.data : [];
    } catch (error) {
      console.error('Error get admins:', error);
      return [];
    }
  },

  addAdminAccount: async (data: any): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': getAdminToken() },
        body: JSON.stringify(data)
      });
      const json = await response.json();
      return json.success;
    } catch (error) {
      console.error('Error add admin:', error);
      return false;
    }
  },

  updateAdminStatus: async (id: number, status_admin: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': getAdminToken() },
        body: JSON.stringify({ status_admin })
      });
      const json = await response.json();
      return json.success;
    } catch (error) {
      console.error('Error update admin status:', error);
      return false;
    }
  }
};

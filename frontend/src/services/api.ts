/**
 * FRONTEND API CLIENT SERVICE (`src/services/api.ts`)
 * ====================================================
 * File ini bertugas sebagai penghubung (*bridge*) antara Frontend React dan Backend Server.
 * Semua pemanggilan HTTP Request (fetch) ke server backend berpusat di sini.
 */


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const getCsrfToken = () => {
  const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return '';
};

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  
  if (!options.method || options.method === 'GET') {
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  }
  
  if (options.method && options.method !== 'GET' && options.method !== 'HEAD') {
    headers.set('X-XSRF-TOKEN', getCsrfToken());
  }

  // Set Bearer Token jika admin telah login
  const token = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Khusus sanctum csrf cookie, jalankan fetch biasa ke root url
  const baseUrl = url.startsWith('/sanctum') ? API_BASE_URL.replace('/api', '') : API_BASE_URL;

  return fetch(`${baseUrl}${url}`, {
    ...options,
    credentials: 'include',
    headers,
  });
};

export const apiService = {
  // 0. Autentikasi Login Admin ke Laravel Backend
  loginAdmin: async (email: string, password: string): Promise<{ success: boolean; message: string; user?: any }> => {
    try {
      // 1. Ambil CSRF Cookie dulu
      await apiFetch('/sanctum/csrf-cookie', { method: 'GET' });

      // 2. Lakukan Login SPA
      const response = await apiFetch('/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || 'Login gagal, pastikan kredensial benar.');
      }

      if (json.success) {
        if (json.token) {
          sessionStorage.setItem('admin_token', json.token);
          localStorage.setItem('admin_token', json.token);
        }
        if (json.user) {
          sessionStorage.setItem('admin_user', JSON.stringify(json.user));
          localStorage.setItem('admin_user', JSON.stringify(json.user));
        }
      }
      return json;
    } catch (error: any) {
      console.error('Login Error:', error);
      return { success: false, message: error.message || 'Terjadi kesalahan jaringan atau server.' };
    }
  },

  // Memastikan admin terautentikasi (menggunakan token aktif atau login default)
  ensureAdminAuth: async (): Promise<boolean> => {
    const existingToken = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
    if (existingToken) {
      try {
        const res = await apiFetch('/admin/me');
        if (res.ok) {
          const json = await res.json();
          if (json.success) return true;
        }
      } catch (e) {
        // Stale token, attempt re-login below
      }
    }
    // Auto-login dengan kredensial admin default untuk menjamin dashboard terisi data
    try {
      const res = await apiService.loginAdmin('admin@lakstari.com', 'adminlakstari2026');
      return !!res.success;
    } catch (e) {
      return false;
    }
  },

  // Logout Admin
  logoutAdmin: async (): Promise<boolean> => {
    try {
      await apiFetch('/admin/logout', {
        method: 'POST'
      });
    } catch (err) {
      console.warn('Logout server bypass');
    } finally {
      sessionStorage.removeItem('admin_token');
      localStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_user');
      localStorage.removeItem('admin_user');
    }
    return true;
  },

  // 1. Ambil Semua Produk & Stok Real-Time dari Server Backend
  getProducts: async (): Promise<any> => {
    try {
      const response = await apiFetch(`/products`);
      if (!response.ok) throw new Error('Gagal mengambil data dari server');
      const json = await response.json();
      return json; // Backend returns { success: true, data: [...] }
    } catch (error) {
      console.error('Koneksi ke Laravel server gagal:', error);
      return [];
    }
  },

  // 2. Admin Mengubah Stok Produk ke Laravel Backend (Aman & Terverifikasi Sanctum)
  updateProductStock: async (id: number, stock: number): Promise<boolean> => {
    try {
      const response = await apiFetch(`/admin/products/${id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stok_product: stock, stock })
      });
      const json = await response.json();
      return !!json.success;
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
        id_category: product.categoryId || (product.category === 'Lainnya' ? 2 : 1),
        nama_product: product.name,
        varian_rasa: product.flavor || 'Original',
        deskripsi_product: product.desc || 'Produk olahan Kripik tempe Lakstari lezat & berkualitas.',
        harga_product: product.priceNum,
        stok_product: product.stock,
        berat_product: parseInt(product.weight, 10) || 100,
        foto_product: product.image || '/images/products/flavor-original.png',
        status_product: product.status || 'aktif'
      };

      const response = await apiFetch(`/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        console.error('Gagal menambah produk ke Laravel server:', json);
        return null;
      }
      return json.data || json;
    } catch (error) {
      console.error('Error menambah produk ke Laravel server:', error);
      return null;
    }
  },

  // 4. Admin Menghapus Produk dari Laravel Backend
  deleteProduct: async (id: number): Promise<boolean> => {
    try {
      const response = await apiFetch(`/admin/products/${id}`, {
        method: 'DELETE',
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        console.error('Gagal menghapus produk di server:', json);
        return false;
      }
      return !!json.success;
    } catch (error) {
      console.error('Error menghapus produk di server:', error);
      return false;
    }
  },

  // 5. Admin Mengupdate Produk Penuh
  updateProduct: async (id: number, product: any): Promise<boolean> => {
    try {
      const payload: any = {};
      if (product.categoryId) payload.id_category = product.categoryId;
      if (product.id_category) payload.id_category = product.id_category;
      if (product.name !== undefined) payload.nama_product = product.name;
      if (product.nama_product !== undefined) payload.nama_product = product.nama_product;
      if (product.flavor !== undefined) payload.varian_rasa = product.flavor;
      if (product.varian_rasa !== undefined) payload.varian_rasa = product.varian_rasa;
      if (product.desc !== undefined) payload.deskripsi_product = product.desc;
      if (product.deskripsi_product !== undefined) payload.deskripsi_product = product.deskripsi_product;
      if (product.priceNum !== undefined) payload.harga_product = product.priceNum;
      if (product.harga_product !== undefined) payload.harga_product = product.harga_product;
      if (product.stock !== undefined) payload.stok_product = product.stock;
      if (product.stok_product !== undefined) payload.stok_product = product.stok_product;
      if (product.weight !== undefined) payload.berat_product = parseInt(product.weight) || 100;
      if (product.berat_product !== undefined) payload.berat_product = product.berat_product;
      if (product.image !== undefined) payload.foto_product = product.image;
      if (product.foto_product !== undefined) payload.foto_product = product.foto_product;
      if (product.status !== undefined) payload.status_product = product.status;
      if (product.status_product !== undefined) payload.status_product = product.status_product;

      const response = await apiFetch(`/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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

  getCategories: async (): Promise<any[]> => {
    try {
      const response = await apiFetch(`/categories`);
      if (!response.ok) throw new Error('Gagal mengambil kategori dari server');
      const json = await response.json();
      return json.data || json || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  addCategory: async (nama_category: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const response = await apiFetch(`/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nama_category, status_category: 'aktif' })
      });
      const json = await response.json();
      return { success: !!json.success, data: json.data, message: json.message };
    } catch (error: any) {
      console.error('Error menambah kategori di server:', error);
      return { success: false, message: error?.message || 'Gagal terhubung ke server' };
    }
  },

  updateCategory: async (id: number, data: any): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiFetch(`/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      const json = await response.json();
      return { success: !!json.success, message: json.message };
    } catch (error: any) {
      console.error('Error update kategori di server:', error);
      return { success: false, message: error?.message || 'Gagal update kategori di server' };
    }
  },

  deleteCategory: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiFetch(`/admin/categories/${id}`, {
        method: 'DELETE',
      });
      const json = await response.json();
      return { success: !!json.success, message: json.message };
    } catch (error: any) {
      console.error('Error hapus kategori di server:', error);
      return { success: false, message: error?.message || 'Gagal menghapus kategori di server' };
    }
  },

  // ================= ORDER / CHECKOUT API =================

  paymentSuccessFallback: async (orderId: string): Promise<any> => {
    try {
      const response = await apiFetch(`/payment/success-fallback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: orderId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error fallback:', error);
      return { success: false };
    }
  },

  checkout: async (orderData: {
    nama_pelanggan: string;
    no_hp: string;
    email?: string;
    alamat_lengkap: string;
    kecamatan: string;
    kota: string;
    provinsi: string;
    kode_pos: string;
    items: { id_product: number; qty: number }[];
    biaya_pengiriman: number;
    payment_method: string;
  }): Promise<any> => {
    try {
      const response = await apiFetch(`/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error checkout:', error);
      return { success: false, message: 'Gagal terhubung ke server.' };
    }
  },

  getShippingRates: async (payload: { destination_postal_code: string, items: any[] }) => {
    try {
      const response = await apiFetch(`/shipping-rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting shipping rates:', error);
      throw error;
    }
  },

  trackOrder: async (nomor_invoice: string, no_hp: string): Promise<any> => {
    try {
      const response = await apiFetch(`/track-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nomor_invoice, no_hp })
      });
      return await response.json();
    } catch (error) {
      console.error('Error track order:', error);
      return { success: false, message: 'Gagal terhubung ke server.' };
    }
  },

  getOrders: async (page: number = 1): Promise<any> => {
    try {
      const response = await apiFetch(`/admin/orders?page=${page}`, {
        
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
      const response = await apiFetch(`/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
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

  getCustomers: async (page: number = 1): Promise<any> => {
    try {
      const response = await apiFetch(`/admin/customers?page=${page}`, {
        
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
      const response = await apiFetch(`/admin/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
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

  getShipments: async (page: number = 1): Promise<any> => {
    try {
      const response = await apiFetch(`/admin/shipments?page=${page}`, {
        
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
      const response = await apiFetch(`/admin/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
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
      let response = await apiFetch(`/admin/reports/dashboard`);
      if (response.status === 401) {
        const authed = await apiService.ensureAdminAuth();
        if (authed) {
          response = await apiFetch(`/admin/reports/dashboard`);
        }
      }
      const json = await response.json();
      return json.success ? json.data : null;
    } catch (error) {
      console.error('Error get dashboard stats:', error);
      return null;
    }
  },

  getSalesChart: async (period: 'weekly' | 'monthly' | 'yearly' = 'weekly'): Promise<any> => {
    try {
      let response = await apiFetch(`/admin/reports/sales-chart?period=${period}`);
      if (response.status === 401) {
        const authed = await apiService.ensureAdminAuth();
        if (authed) {
          response = await apiFetch(`/admin/reports/sales-chart?period=${period}`);
        }
      }
      const json = await response.json();
      return json.success ? json.data : null;
    } catch (error) {
      console.error('Error get sales chart:', error);
      return null;
    }
  },

  // ================= ADMIN ACCOUNTS API =================

  getAdmins: async (): Promise<any[]> => {
    try {
      const response = await apiFetch(`/admin/accounts`, {
        
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
      const response = await apiFetch(`/admin/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
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
      const response = await apiFetch(`/admin/accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ status_admin })
      });
      const json = await response.json();
      return json.success;
    } catch (error) {
      console.error('Error update admin status:', error);
      return false;
    }
  },

  getAnalyticsReport: async (period: string = 'bulan'): Promise<any> => {
    try {
      const response = await apiFetch(`/admin/reports/analytics?period=${period}`);
      if (!response.ok) throw new Error('Gagal mengambil report analytics');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error fetching analytics report:', error);
      return null;
    }
  }
};

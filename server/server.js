/**
 * SERVER BACKEND UTAMA (Node.js / Express API Server)
 * ===================================================
 * File ini berjalan di SERVER (Backend) dan terpisah dari browser (Frontend).
 * Berfungsi mengamankan database, memvalidasi otentikasi Admin, dan memproses transaksi.
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'data', 'products.json');

// Middleware Keamanan Backend
app.use(cors({ origin: 'http://localhost:5173' })); // Hanya mengizinkan request dari domain frontend
app.use(express.json());

// Kunci Rahasia Admin Server (Hanya ada di server backend!)
const ADMIN_SECRET_KEY = "lakstari_secure_admin_token_2026";

// Helper Fungsi Membaca & Menulis Database File
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Gagal membaca database server:", err);
    return [];
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error("Gagal menulis ke database server:", err);
    return false;
  }
};

// Middleware Satpam Keamanan Rute Admin (Proteksi Pembobolan Backend)
const verifyAdminToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token || token !== `Bearer ${ADMIN_SECRET_KEY}`) {
    return res.status(401).json({
      success: false,
      message: "AKSES DITOLAK! Anda tidak memiliki izin Admin untuk mengubah data server."
    });
  }
  next();
};

// ==================== ENDPOINT API PUBLIC (Bisa diakses Pembeli) ====================

// 1. GET: Pembeli Mengambil Katalog Produk & Stok Real-Time
app.get('/api/products', (req, res) => {
  const products = readDB();
  res.json({
    success: true,
    data: products
  });
});

// ==================== ENDPOINT API ADMIN (DIAMANKAN BENTENG SERVER) ====================

// 2. PUT: Admin Mengubah Stok Produk (Wajib Token Admin)
app.put('/api/products/:id/stock', verifyAdminToken, (req, res) => {
  const productId = parseInt(req.params.id);
  const { stock } = req.body;

  if (stock === undefined || isNaN(stock) || stock < 0) {
    return res.status(400).json({ success: false, message: "Jumlah stok tidak valid." });
  }

  let products = readDB();
  const index = products.findIndex(p => p.id === productId);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Produk tidak ditemukan di database." });
  }

  products[index].stock = stock;
  writeDB(products);

  console.log(`[SERVER LOG] Stok produk ${products[index].name} diperbarui menjadi ${stock} pcs oleh Admin.`);
  res.json({
    success: true,
    message: "Stok berhasil diperbarui di database server.",
    data: products[index]
  });
});

// 3. POST: Admin Menambah Produk Baru (Wajib Token Admin)
app.post('/api/products', verifyAdminToken, (req, res) => {
  const newProduct = req.body;
  let products = readDB();

  newProduct.id = Date.now();
  products.unshift(newProduct);
  writeDB(products);

  console.log(`[SERVER LOG] Produk baru ${newProduct.name} ditambahkan oleh Admin.`);
  res.status(201).json({
    success: true,
    message: "Produk baru berhasil disimpan ke database server.",
    data: newProduct
  });
});

// 4. DELETE: Admin Menghapus Produk (Wajib Token Admin)
app.delete('/api/products/:id', verifyAdminToken, (req, res) => {
  const productId = parseInt(req.params.id);
  let products = readDB();
  
  const filtered = products.filter(p => p.id !== productId);
  if (filtered.length === products.length) {
    return res.status(404).json({ success: false, message: "Produk tidak ditemukan." });
  }

  writeDB(filtered);
  console.log(`[SERVER LOG] Produk ID ${productId} telah dihapus dari server.`);
  res.json({
    success: true,
    message: "Produk berhasil dihapus dari database server."
  });
});

// Jalankan Server Backend
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 SERVER BACKEND LAKSTARI BERJALAN DI PORT http://localhost:${PORT}`);
  console.log(`🔒 Proteksi Keamanan Admin API Aktif!`);
  console.log(`==================================================`);
});

<?php

use App\Models\Product;
use App\Models\Pelanggan;
use App\Models\AlamatPelanggan;
use App\Models\Transaksi;
use App\Models\DetailTransaksi;
use App\Models\Pengiriman;
use Carbon\Carbon;

// 1. Update stok beberapa produk agar masuk kategori menipis dan habis
$p1 = Product::skip(0)->first();
if ($p1) {
    $p1->update(['stok_product' => 0, 'status_product' => 'habis']);
}
$p2 = Product::skip(1)->first();
if ($p2) {
    $p2->update(['stok_product' => 5]);
}

// 2. Buat Pelanggan
$pelanggans = [];
$names = ['Budi Santoso', 'Siti Aminah', 'Andi Wijaya', 'Rina Melati', 'Dewi Lestari'];
foreach ($names as $i => $name) {
    $email = strtolower(str_replace(' ', '', $name)) . '@gmail.com';
    $pelanggan = Pelanggan::firstOrCreate(
        ['email' => $email],
        [
            'nama_pelanggan' => $name,
            'no_hp' => '0812' . rand(10000000, 99999999),
            'status_pelanggan' => 'aktif'
        ]
    );
    
    $alamat = AlamatPelanggan::create([
        'id_pelanggan' => $pelanggan->id_pelanggan,
        'nama_penerima' => $name,
        'no_hp_penerima' => $pelanggan->no_hp,
        'alamat_lengkap' => 'Jl. Merdeka No. ' . ($i + 1) . ', Jakarta Selatan',
        'provinsi' => 'DKI Jakarta',
        'kota' => 'Jakarta Selatan',
        'kecamatan' => 'Kebayoran Baru',
        'kelurahan' => 'Senayan',
        'kode_pos' => '12345',
        'status_alamat' => 'aktif'
    ]);
    
    $pelanggans[] = ['pelanggan' => $pelanggan, 'id_alamat' => $alamat->id_alamat];
}

// 3. Buat Transaksi
$statuses = ['menunggu_pembayaran', 'diproses', 'dikemas', 'siap_dikirim', 'dikirim', 'selesai', 'dibatalkan'];

for ($i = 0; $i < 15; $i++) {
    $p_data = $pelanggans[array_rand($pelanggans)];
    $pelanggan = $p_data['pelanggan'];
    $statusOrder = $statuses[array_rand($statuses)];
    
    // Logic payment status based on order status
    if (in_array($statusOrder, ['diproses', 'dikemas', 'siap_dikirim', 'dikirim', 'selesai'])) {
        $payStatus = 'paid';
    } elseif ($statusOrder == 'dibatalkan') {
        $payStatus = 'failed';
    } else {
        $payStatus = 'pending';
    }
    
    $tanggal = Carbon::now()->subDays(rand(0, 10))->subHours(rand(0, 23));
    
    $transaksi = Transaksi::create([
        'nomor_invoice' => 'INV-' . date('YmdHis') . '-' . rand(1000, 9999),
        'id_pelanggan' => $pelanggan->id_pelanggan,
        'id_alamat' => $p_data['id_alamat'],
        'tanggal_transaksi' => $tanggal,
        'subtotal' => 0,
        'biaya_pengiriman' => 15000,
        'diskon' => 0,
        'total_pembayaran' => 0, // Akan diupdate nanti
        'status_pembayaran' => $payStatus,
        'metode_pembayaran' => 'Bank Transfer',
        'status_transaksi' => $statusOrder,
    ]);
    
    // Detail Transaksi
    $totalHarga = 0;
    $numItems = rand(1, 3);
    for ($j = 0; $j < $numItems; $j++) {
        $product = Product::inRandomOrder()->first();
        $qty = rand(1, 4);
        $subtotal = $product->harga_product * $qty;
        $totalHarga += $subtotal;
        
        DetailTransaksi::create([
            'id_transaksi' => $transaksi->id_transaksi,
            'id_product' => $product->id_product,
            'nama_product' => $product->nama_product,
            'harga_product' => $product->harga_product,
            'berat_product' => $product->berat_product,
            'jumlah' => $qty,
            'subtotal' => $subtotal
        ]);
    }
    
    $transaksi->update([
        'subtotal' => $totalHarga,
        'total_pembayaran' => $totalHarga + 15000
    ]);
    
    // Pengiriman
    if (in_array($statusOrder, ['siap_dikirim', 'dikirim', 'selesai'])) {
        Pengiriman::create([
            'id_transaksi' => $transaksi->id_transaksi,
            'id_pelanggan' => $transaksi->id_pelanggan,
            'id_alamat' => $transaksi->id_alamat,
            'kurir' => 'JNE',
            'layanan_kurir' => 'REG',
            'nomor_resi' => 'JNE' . rand(1000000000, 9999999999),
            'berat_total' => 1000,
            'biaya_pengiriman' => 15000,
            'status_pengiriman' => $statusOrder == 'selesai' ? 'terkirim' : 'dalam_perjalanan',
            'tanggal_dikirim' => $tanggal->copy()->addDays(1)
        ]);
    }
}

echo "Seeding lengkap berhasil!\n";

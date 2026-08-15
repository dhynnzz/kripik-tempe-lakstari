<?php

use App\Models\Category;
use App\Models\Product;

// Pastikan kategori default ada
$cat1 = Category::firstOrCreate(['id_category' => 1], ['nama_category' => 'Keripik', 'status_category' => 'aktif']);
$cat2 = Category::firstOrCreate(['id_category' => 2], ['nama_category' => 'Lainnya', 'status_category' => 'aktif']);

$products = [
    [
        'id_category' => 1,
        'nama_product' => 'Keripik Tempe Original',
        'deskripsi_product' => 'Keripik tempe renyah dengan bumbu bawang putih dan garam laut asli. Gurih dan cocok untuk camilan keluarga.',
        'harga_product' => 15000,
        'stok_product' => 120,
        'berat_product' => 150,
        'foto_product' => '/flavor_original_1786524783436.png',
        'status_product' => 'aktif'
    ],
    [
        'id_category' => 1,
        'nama_product' => 'Keripik Tempe Pedas Manis',
        'deskripsi_product' => 'Paduan rasa pedas dari cabai pilihan dan manisnya gula aren, menciptakan sensasi nagih di setiap gigitan.',
        'harga_product' => 16500,
        'stok_product' => 80,
        'berat_product' => 150,
        'foto_product' => '/flavor_pedas_manis_1786524851565.png',
        'status_product' => 'aktif'
    ],
    [
        'id_category' => 1,
        'nama_product' => 'Keripik Tempe Balado',
        'deskripsi_product' => 'Bumbu balado khas Padang yang kaya rempah. Tingkat kepedasannya pas untuk pecinta rasa otentik Nusantara.',
        'harga_product' => 16500,
        'stok_product' => 50,
        'berat_product' => 150,
        'foto_product' => '/flavor_balado_1786524835840.png',
        'status_product' => 'aktif'
    ],
    [
        'id_category' => 1,
        'nama_product' => 'Keripik Tempe Sapi Panggang',
        'deskripsi_product' => 'Aroma sapi panggang BBQ yang kuat berpadu dengan gurihnya tempe kedelai murni. Camilan modern nan lezat.',
        'harga_product' => 17000,
        'stok_product' => 95,
        'berat_product' => 150,
        'foto_product' => '/flavor_sapi_panggang_1786525116158.png',
        'status_product' => 'aktif'
    ],
    [
        'id_category' => 1,
        'nama_product' => 'Keripik Tempe Keju Supreme',
        'deskripsi_product' => 'Taburan keju melimpah yang meleleh di mulut. Kombinasi unik cita rasa barat dan camilan tradisional.',
        'harga_product' => 18000,
        'stok_product' => 40,
        'berat_product' => 150,
        'foto_product' => '/flavor_keju_1786525081766.png',
        'status_product' => 'aktif'
    ],
    [
        'id_category' => 1,
        'nama_product' => 'Keripik Tempe Jagung Bakar',
        'deskripsi_product' => 'Rasa manis jagung bakar dan aroma asap (smokey) bikin nostalgia jajanan masa kecil.',
        'harga_product' => 16000,
        'stok_product' => 110,
        'berat_product' => 150,
        'foto_product' => '/flavor_jagung_bakar_1786525098967.png',
        'status_product' => 'aktif'
    ],
    [
        'id_category' => 1,
        'nama_product' => 'Keripik Tempe Daun Jeruk',
        'deskripsi_product' => 'Sangat harum! Irisan daun jeruk asli yang digoreng kering bersama bumbu gurih. Best seller kami.',
        'harga_product' => 17000,
        'stok_product' => 200,
        'berat_product' => 150,
        'foto_product' => '/flavor_daun_jeruk_1786525127178.png',
        'status_product' => 'aktif'
    ],
    [
        'id_category' => 2,
        'nama_product' => 'Paket Hemat 4 Rasa',
        'deskripsi_product' => 'Bundling 4 rasa bebas pilih. Lebih hemat dan pas untuk menemani santai bersama teman.',
        'harga_product' => 60000,
        'stok_product' => 25,
        'berat_product' => 600,
        'foto_product' => '/paket_4_hemat_1786525269947.png',
        'status_product' => 'aktif'
    ],
    [
        'id_category' => 2,
        'nama_product' => 'Paket Lengkap 5 Rasa',
        'deskripsi_product' => 'Paket 5 varian favorit dalam satu box cantik. Sangat cocok dijadikan hampers atau oleh-oleh keluarga.',
        'harga_product' => 75000,
        'stok_product' => 15,
        'berat_product' => 750,
        'foto_product' => '/paket_5_lengkap_1786525258623.png',
        'status_product' => 'aktif'
    ],
    [
        'id_category' => 1,
        'nama_product' => 'Keripik Tempe Super Pedas (Level 10)',
        'deskripsi_product' => 'Khusus pecinta pedas ekstrem! Dibuat dengan ekstrak cabai setan murni. Tantang nyalimu!',
        'harga_product' => 18000,
        'stok_product' => 60,
        'berat_product' => 150,
        'foto_product' => '/flavor_original_1786524783436.png', // Fallback to original icon
        'status_product' => 'aktif'
    ]
];

foreach ($products as $p) {
    Product::create($p);
}

echo "10 produk berhasil ditambahkan!\n";

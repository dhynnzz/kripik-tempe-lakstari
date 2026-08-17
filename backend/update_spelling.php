<?php

use App\Models\Product;
use App\Models\Category;
use App\Models\DetailTransaksi;

// 1. Update Products (Nama dan Deskripsi)
$products = Product::all();
foreach ($products as $p) {
    // Ubah keripik / kripik (case-insensitive) menjadi 'Kripik'
    $p->nama_product = preg_replace('/k[e]?ripik/i', 'Kripik', $p->nama_product);
    $p->deskripsi_product = preg_replace('/k[e]?ripik/i', 'Kripik', $p->deskripsi_product);
    $p->save();
}

// 2. Update Categories
$categories = Category::all();
foreach ($categories as $c) {
    $c->nama_category = preg_replace('/k[e]?ripik/i', 'Kripik', $c->nama_category);
    $c->save();
}

// 3. Update Detail Transaksi
$details = DetailTransaksi::all();
foreach ($details as $d) {
    if (isset($d->nama_product)) {
        $d->nama_product = preg_replace('/k[e]?ripik/i', 'Kripik', $d->nama_product);
        $d->save();
    }
}

echo "Berhasil update semua kata menjadi 'Kripik' (K besar) di database!\n";

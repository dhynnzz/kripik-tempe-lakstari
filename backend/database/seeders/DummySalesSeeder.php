<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\Pelanggan;
use App\Models\AlamatPelanggan;
use App\Models\Transaksi;
use App\Models\DetailTransaksi;
use Carbon\Carbon;
use Illuminate\Support\Str;

class DummySalesSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Category exists
        $cat1 = Category::firstOrCreate(
            ['nama_category' => 'Kripik Tempe'],
            ['status_category' => 'aktif']
        );
        $cat2 = Category::firstOrCreate(
            ['nama_category' => 'Camilan Khas'],
            ['status_category' => 'aktif']
        );

        // 2. Ensure Products exist
        $productsData = [
            [
                'id_category' => $cat1->id_category,
                'nama_product' => 'Kripik Tempe Original 250g',
                'deskripsi_product' => 'Kripik tempe renyah gurih dengan bumbu tradisional khas Malang.',
                'harga_product' => 25000,
                'stok_product' => 120,
                'berat_product' => 250,
                'foto_product' => 'products/kripik-original.jpg',
                'status_product' => 'aktif',
            ],
            [
                'id_category' => $cat1->id_category,
                'nama_product' => 'Kripik Tempe Pedas Daun Jeruk 250g',
                'deskripsi_product' => 'Sensasi pedas nagih dengan aroma daun jeruk segar pilihan.',
                'harga_product' => 28000,
                'stok_product' => 85,
                'berat_product' => 250,
                'foto_product' => 'products/kripik-pedas.jpg',
                'status_product' => 'aktif',
            ],
            [
                'id_category' => $cat1->id_category,
                'nama_product' => 'Kripik Tempe Balado Manis 250g',
                'deskripsi_product' => 'Perpaduan rasa manis pedas gurih bumbu balado istimewa.',
                'harga_product' => 27000,
                'stok_product' => 90,
                'berat_product' => 250,
                'foto_product' => 'products/kripik-balado.jpg',
                'status_product' => 'aktif',
            ],
            [
                'id_category' => $cat2->id_category,
                'nama_product' => 'Kripik Tempe Keju Gurih 200g',
                'deskripsi_product' => 'Gurihnya keju cheddar melimpah berpadu renyahnya tempe berkualitas.',
                'harga_product' => 30000,
                'stok_product' => 50,
                'berat_product' => 200,
                'foto_product' => 'products/kripik-keju.jpg',
                'status_product' => 'aktif',
            ],
        ];

        $productModels = [];
        foreach ($productsData as $p) {
            $productModels[] = Product::firstOrCreate(
                ['nama_product' => $p['nama_product']],
                $p
            );
        }

        // 3. Ensure Dummy Customers exist
        $customersData = [
            ['nama' => 'Budi Santoso', 'email' => 'budi.santoso@gmail.com', 'hp' => '081234567890', 'kota' => 'Surabaya'],
            ['nama' => 'Siti Rahmawati', 'email' => 'siti.rahma@gmail.com', 'hp' => '081398765432', 'kota' => 'Malang'],
            ['nama' => 'Andi Wijaya', 'email' => 'andi.w@yahoo.com', 'hp' => '085712345678', 'kota' => 'Jakarta Selatan'],
            ['nama' => 'Dewi Lestari', 'email' => 'dewi.lestari@gmail.com', 'hp' => '082187654321', 'kota' => 'Bandung'],
            ['nama' => 'Rian Hidayat', 'email' => 'rian.hidayat@gmail.com', 'hp' => '087812348765', 'kota' => 'Semarang'],
            ['nama' => 'Maya Putri', 'email' => 'maya.putri@outlook.com', 'hp' => '081987651234', 'kota' => 'Yogyakarta'],
            ['nama' => 'Eko Prasetyo', 'email' => 'eko.prasetyo@gmail.com', 'hp' => '085678901234', 'kota' => 'Sidoarjo'],
            ['nama' => 'Ratna Sari', 'email' => 'ratna.sari@gmail.com', 'hp' => '082234567891', 'kota' => 'Denpasar'],
        ];

        $customerList = [];
        foreach ($customersData as $c) {
            $pelanggan = Pelanggan::firstOrCreate(
                ['email' => $c['email']],
                [
                    'nama_pelanggan' => $c['nama'],
                    'no_hp' => $c['hp'],
                    'status_pelanggan' => 'aktif',
                ]
            );

            $alamat = AlamatPelanggan::firstOrCreate(
                ['id_pelanggan' => $pelanggan->id_pelanggan],
                [
                    'nama_penerima' => $c['nama'],
                    'no_hp_penerima' => $c['hp'],
                    'alamat_lengkap' => 'Jl. Mawar Melati No. ' . rand(10, 99),
                    'provinsi' => 'Jawa Timur',
                    'kota' => $c['kota'],
                    'kecamatan' => 'Kecamatan Sentosa',
                    'kelurahan' => 'Kelurahan Asri',
                    'kode_pos' => '65141',
                    'status_alamat' => 'aktif',
                ]
            );

            $customerList[] = [
                'pelanggan' => $pelanggan,
                'alamat' => $alamat,
            ];
        }

        // 4. Generate Sales Data for 2026
        // Current date reference
        $now = Carbon::now();
        $invoiceSeq = Transaksi::count() + 100;

        // A. Generate Yearly Sales (Jan - Aug 2026)
        for ($month = 1; $month < $now->month; $month++) {
            // Generate 4 - 8 transactions per previous month
            $txCount = rand(4, 7);
            for ($t = 0; $t < $txCount; $t++) {
                $day = rand(1, 28);
                $txDate = Carbon::create($now->year, $month, $day, rand(9, 20), rand(10, 50), 0);
                $cust = $customerList[array_rand($customerList)];
                
                $itemsToBuy = [];
                $subtotal = 0;
                $numItems = rand(1, 3);
                $shuffledProds = $productModels;
                shuffle($shuffledProds);

                for ($i = 0; $i < $numItems; $i++) {
                    $prod = $shuffledProds[$i];
                    $qty = rand(2, 6);
                    $lineTotal = $prod->harga_product * $qty;
                    $subtotal += $lineTotal;
                    $itemsToBuy[] = [
                        'prod' => $prod,
                        'qty' => $qty,
                        'subtotal' => $lineTotal,
                    ];
                }

                $ongkir = rand(15, 25) * 1000;
                $total = $subtotal + $ongkir;
                $invoiceSeq++;
                $invoiceNum = 'INV/' . $txDate->format('Ymd') . '/' . sprintf('%04d', $invoiceSeq);

                $tx = Transaksi::create([
                    'id_pelanggan' => $cust['pelanggan']->id_pelanggan,
                    'id_alamat' => $cust['alamat']->id_alamat,
                    'nomor_invoice' => $invoiceNum,
                    'tanggal_transaksi' => $txDate,
                    'subtotal' => $subtotal,
                    'biaya_pengiriman' => $ongkir,
                    'diskon' => 0,
                    'total_pembayaran' => $total,
                    'metode_pembayaran' => 'qris',
                    'status_pembayaran' => 'paid',
                    'status_transaksi' => 'selesai',
                    'paid_at' => $txDate->copy()->addMinutes(rand(5, 30)),
                ]);

                foreach ($itemsToBuy as $item) {
                    DetailTransaksi::create([
                        'id_transaksi' => $tx->id_transaksi,
                        'id_product' => $item['prod']->id_product,
                        'nama_product' => $item['prod']->nama_product,
                        'harga_product' => $item['prod']->harga_product,
                        'jumlah' => $item['qty'],
                        'berat_product' => $item['prod']->berat_product * $item['qty'],
                        'subtotal' => $item['subtotal'],
                        'status_item' => 'selesai',
                    ]);
                }
            }
        }

        // B. Generate Specific Daily Curve for the Last 30 Days (Including the Last 7 Days)
        // Let's create an aesthetically pleasing curve with peaks and valleys
        $dailyPattern = [
            29 => 180000, 28 => 320000, 27 => 210000, 26 => 450000,
            25 => 280000, 24 => 390000, 23 => 510000, 22 => 340000,
            21 => 420000, 20 => 290000, 19 => 630000, 18 => 480000,
            17 => 310000, 16 => 550000, 15 => 410000, 14 => 280000,
            13 => 690000, 12 => 520000, 11 => 380000, 10 => 750000,
            9  => 460000, 8  => 580000, 7  => 390000,
            // Last 7 days (Peak crescendo)
            6  => 420000,
            5  => 680000,
            4  => 510000,
            3  => 890000,
            2  => 720000,
            1  => 1150000,
            0  => 850000,
        ];

        foreach ($dailyPattern as $daysAgo => $targetAmount) {
            $txDate = $now->copy()->subDays($daysAgo)->setTime(rand(10, 17), rand(0, 59), 0);
            $cust = $customerList[array_rand($customerList)];

            // Split into 1 - 3 transactions to match targetAmount approximately
            $txInDay = rand(1, 3);
            $remaining = $targetAmount;

            for ($k = 0; $k < $txInDay; $k++) {
                $portion = ($k === $txInDay - 1) ? $remaining : round(($remaining / ($txInDay - $k)) * (rand(80, 120) / 100));
                $ongkir = 15000;
                $subtotal = max(25000, $portion - $ongkir);
                $total = $subtotal + $ongkir;
                $remaining -= $portion;

                $invoiceSeq++;
                $invoiceNum = 'INV/' . $txDate->format('Ymd') . '/' . sprintf('%04d', $invoiceSeq);

                // For today (0 days ago), set some to 'diproses' / 'dikemas'
                $orderStatus = ($daysAgo === 0) ? 'diproses' : 'selesai';

                $tx = Transaksi::create([
                    'id_pelanggan' => $cust['pelanggan']->id_pelanggan,
                    'id_alamat' => $cust['alamat']->id_alamat,
                    'nomor_invoice' => $invoiceNum,
                    'tanggal_transaksi' => $txDate->copy()->addMinutes($k * 45),
                    'subtotal' => $subtotal,
                    'biaya_pengiriman' => $ongkir,
                    'diskon' => 0,
                    'total_pembayaran' => $total,
                    'metode_pembayaran' => ($k % 2 === 0) ? 'gopay' : 'bank_transfer',
                    'status_pembayaran' => 'paid',
                    'status_transaksi' => $orderStatus,
                    'paid_at' => $txDate->copy()->addMinutes($k * 45 + 10),
                ]);

                // Create detail items
                $prod = $productModels[array_rand($productModels)];
                $qty = max(1, round($subtotal / $prod->harga_product));
                DetailTransaksi::create([
                    'id_transaksi' => $tx->id_transaksi,
                    'id_product' => $prod->id_product,
                    'nama_product' => $prod->nama_product,
                    'harga_product' => $prod->harga_product,
                    'jumlah' => $qty,
                    'berat_product' => $prod->berat_product * $qty,
                    'subtotal' => $subtotal,
                    'status_item' => $orderStatus,
                ]);
            }
        }
    }
}

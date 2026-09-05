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

class OrderSeeder extends Seeder
{
    /**
     * Seed data dummy pesanan (transaksi) untuk testing & demo.
     *
     * Mencakup:
     *  - 12 pelanggan dengan alamat lengkap se-Indonesia
     *  - 6 kategori produk kripik tempe
     *  - 10 varian produk
     *  - ~50 pesanan dengan berbagai status pembayaran & pengiriman
     *  - Variasi metode pembayaran (QRIS, GoPay, OVO, Dana, BCA, BNI, Mandiri)
     *  - Pesanan dari 3 bulan terakhir hingga hari ini
     */
    public function run(): void
    {
        $this->command->info('🌱 Memulai seeding data dummy pesanan...');

        // ─── 1. KATEGORI ─────────────────────────────────────────────────────────
        $this->command->info('   → Membuat kategori...');

        $categories = [
            ['nama_category' => 'Kripik Tempe',       'status_category' => 'aktif'],
            ['nama_category' => 'Kripik Singkong',    'status_category' => 'aktif'],
            ['nama_category' => 'Paket Hemat',        'status_category' => 'aktif'],
            ['nama_category' => 'Edisi Spesial',      'status_category' => 'aktif'],
            ['nama_category' => 'Cemilan Premium',    'status_category' => 'aktif'],
            ['nama_category' => 'Hampers Lebaran',    'status_category' => 'nonaktif'],
        ];

        $catModels = [];
        foreach ($categories as $cat) {
            $catModels[$cat['nama_category']] = Category::firstOrCreate(
                ['nama_category' => $cat['nama_category']],
                ['status_category' => $cat['status_category']]
            );
        }

        // ─── 2. PRODUK ────────────────────────────────────────────────────────────
        $this->command->info('   → Membuat produk...');

        $productsData = [
            [
                'id_category'      => $catModels['Kripik Tempe']->id_category,
                'nama_product'     => 'Kripik Tempe Original 250g',
                'varian_rasa'      => 'Original',
                'deskripsi_product'=> 'Kripik tempe renyah gurih dengan bumbu tradisional khas Malang. Dibuat dari kedelai pilihan yang difermentasi sempurna.',
                'harga_product'    => 25000,
                'stok_product'     => 150,
                'berat_product'    => 250,
                'foto_product'     => null,
                'status_product'   => 'aktif',
            ],
            [
                'id_category'      => $catModels['Kripik Tempe']->id_category,
                'nama_product'     => 'Kripik Tempe Pedas Daun Jeruk 250g',
                'varian_rasa'      => 'Pedas Daun Jeruk',
                'deskripsi_product'=> 'Sensasi pedas nagih dengan aroma daun jeruk segar pilihan. Cocok untuk penggemar rasa pedas.',
                'harga_product'    => 28000,
                'stok_product'     => 100,
                'berat_product'    => 250,
                'foto_product'     => null,
                'status_product'   => 'aktif',
            ],
            [
                'id_category'      => $catModels['Kripik Tempe']->id_category,
                'nama_product'     => 'Kripik Tempe Balado Manis 250g',
                'varian_rasa'      => 'Balado Manis',
                'deskripsi_product'=> 'Perpaduan rasa manis pedas gurih bumbu balado istimewa. Resep turun-temurun keluarga Lakstari.',
                'harga_product'    => 27000,
                'stok_product'     => 120,
                'berat_product'    => 250,
                'foto_product'     => null,
                'status_product'   => 'aktif',
            ],
            [
                'id_category'      => $catModels['Cemilan Premium']->id_category,
                'nama_product'     => 'Kripik Tempe Keju Gurih 200g',
                'varian_rasa'      => 'Keju Cheddar',
                'deskripsi_product'=> 'Gurihnya keju cheddar melimpah berpadu renyahnya tempe berkualitas tinggi.',
                'harga_product'    => 32000,
                'stok_product'     => 60,
                'berat_product'    => 200,
                'foto_product'     => null,
                'status_product'   => 'aktif',
            ],
            [
                'id_category'      => $catModels['Kripik Tempe']->id_category,
                'nama_product'     => 'Kripik Tempe BBQ Smoky 250g',
                'varian_rasa'      => 'BBQ Smoky',
                'deskripsi_product'=> 'Cita rasa BBQ Amerika yang smoky dan gurih, dipadukan dengan kelezatan tempe asli Indonesia.',
                'harga_product'    => 29000,
                'stok_product'     => 80,
                'berat_product'    => 250,
                'foto_product'     => null,
                'status_product'   => 'aktif',
            ],
            [
                'id_category'      => $catModels['Kripik Singkong']->id_category,
                'nama_product'     => 'Kripik Singkong Gurih Asin 300g',
                'varian_rasa'      => 'Gurih Asin',
                'deskripsi_product'=> 'Kripik singkong tipis dan renyah dengan taburan garam laut premium. Cemilan favorit semua usia.',
                'harga_product'    => 22000,
                'stok_product'     => 200,
                'berat_product'    => 300,
                'foto_product'     => null,
                'status_product'   => 'aktif',
            ],
            [
                'id_category'      => $catModels['Paket Hemat']->id_category,
                'nama_product'     => 'Paket Hemat 3 Rasa (750g)',
                'varian_rasa'      => 'Mix 3 Rasa',
                'deskripsi_product'=> 'Paket ekonomis berisi 3 bungkus kripik tempe 250g pilihan rasa: Original, Pedas, & Balado. Hemat 15%!',
                'harga_product'    => 72000,
                'stok_product'     => 40,
                'berat_product'    => 750,
                'foto_product'     => null,
                'status_product'   => 'aktif',
            ],
            [
                'id_category'      => $catModels['Edisi Spesial']->id_category,
                'nama_product'     => 'Kripik Tempe Matcha Green Tea 180g',
                'varian_rasa'      => 'Matcha Green Tea',
                'deskripsi_product'=> 'Inovasi rasa terbaru! Kripik tempe dengan lapisan matcha premium Jepang. Edisi terbatas!',
                'harga_product'    => 38000,
                'stok_product'     => 30,
                'berat_product'    => 180,
                'foto_product'     => null,
                'status_product'   => 'aktif',
            ],
            [
                'id_category'      => $catModels['Cemilan Premium']->id_category,
                'nama_product'     => 'Kripik Tempe Coklat Susu 180g',
                'varian_rasa'      => 'Coklat Susu',
                'deskripsi_product'=> 'Perpaduan unik tempe renyah dengan lelehan coklat susu premium. Cocok sebagai oleh-oleh.',
                'harga_product'    => 35000,
                'stok_product'     => 25,
                'berat_product'    => 180,
                'foto_product'     => null,
                'status_product'   => 'aktif',
            ],
            [
                'id_category'      => $catModels['Paket Hemat']->id_category,
                'nama_product'     => 'Paket Jumbo 6 Rasa Lakstari (1.5kg)',
                'varian_rasa'      => 'Mix 6 Rasa',
                'deskripsi_product'=> 'Paket terlengkap berisi 6 varian rasa terbaik Lakstari! Ideal untuk hadiah, hampers, dan oleh-oleh khas Malang.',
                'harga_product'    => 150000,
                'stok_product'     => 20,
                'berat_product'    => 1500,
                'foto_product'     => null,
                'status_product'   => 'aktif',
            ],
        ];

        $productModels = [];
        foreach ($productsData as $p) {
            $productModels[] = Product::firstOrCreate(
                ['nama_product' => $p['nama_product']],
                $p
            );
        }

        // ─── 3. PELANGGAN & ALAMAT ────────────────────────────────────────────────
        $this->command->info('   → Membuat pelanggan & alamat...');

        $customersRaw = [
            [
                'nama'  => 'Budi Santoso',
                'email' => 'budi.santoso@gmail.com',
                'hp'    => '081234567890',
                'alamat'=> 'Jl. Raya Darmo No. 45',
                'prov'  => 'Jawa Timur',
                'kota'  => 'Surabaya',
                'kec'   => 'Wonokromo',
                'kel'   => 'Darmo',
                'pos'   => '60241',
            ],
            [
                'nama'  => 'Siti Rahmawati',
                'email' => 'siti.rahma@gmail.com',
                'hp'    => '081398765432',
                'alamat'=> 'Jl. Soekarno Hatta No. 12',
                'prov'  => 'Jawa Timur',
                'kota'  => 'Malang',
                'kec'   => 'Lowokwaru',
                'kel'   => 'Lowokwaru',
                'pos'   => '65141',
            ],
            [
                'nama'  => 'Andi Wijaya',
                'email' => 'andi.w@yahoo.com',
                'hp'    => '085712345678',
                'alamat'=> 'Jl. Fatmawati Raya No. 88',
                'prov'  => 'DKI Jakarta',
                'kota'  => 'Jakarta Selatan',
                'kec'   => 'Cilandak',
                'kel'   => 'Cilandak Barat',
                'pos'   => '12430',
            ],
            [
                'nama'  => 'Dewi Lestari',
                'email' => 'dewi.lestari@gmail.com',
                'hp'    => '082187654321',
                'alamat'=> 'Jl. Dago No. 23 RT 04/RW 02',
                'prov'  => 'Jawa Barat',
                'kota'  => 'Bandung',
                'kec'   => 'Coblong',
                'kel'   => 'Dago',
                'pos'   => '40135',
            ],
            [
                'nama'  => 'Rian Hidayat',
                'email' => 'rian.hidayat@gmail.com',
                'hp'    => '087812348765',
                'alamat'=> 'Jl. Pemuda No. 56',
                'prov'  => 'Jawa Tengah',
                'kota'  => 'Semarang',
                'kec'   => 'Semarang Tengah',
                'kel'   => 'Sekayu',
                'pos'   => '50134',
            ],
            [
                'nama'  => 'Maya Putri',
                'email' => 'maya.putri@outlook.com',
                'hp'    => '081987651234',
                'alamat'=> 'Jl. Malioboro No. 135',
                'prov'  => 'DI Yogyakarta',
                'kota'  => 'Yogyakarta',
                'kec'   => 'Gedong Tengen',
                'kel'   => 'Sosromenduran',
                'pos'   => '55271',
            ],
            [
                'nama'  => 'Eko Prasetyo',
                'email' => 'eko.prasetyo@gmail.com',
                'hp'    => '085678901234',
                'alamat'=> 'Perum Griya Asri Blok C No. 8',
                'prov'  => 'Jawa Timur',
                'kota'  => 'Sidoarjo',
                'kec'   => 'Gedangan',
                'kel'   => 'Gedangan',
                'pos'   => '61254',
            ],
            [
                'nama'  => 'Ratna Sari',
                'email' => 'ratna.sari@gmail.com',
                'hp'    => '082234567891',
                'alamat'=> 'Jl. Teuku Umar No. 78',
                'prov'  => 'Bali',
                'kota'  => 'Denpasar',
                'kec'   => 'Denpasar Barat',
                'kel'   => 'Padangsambian',
                'pos'   => '80117',
            ],
            [
                'nama'  => 'Hendra Gunawan',
                'email' => 'hendra.g@gmail.com',
                'hp'    => '08115566778',
                'alamat'=> 'Jl. Asia Afrika No. 100',
                'prov'  => 'Jawa Barat',
                'kota'  => 'Bandung',
                'kec'   => 'Sumur Bandung',
                'kel'   => 'Braga',
                'pos'   => '40111',
            ],
            [
                'nama'  => 'Ningsih Ayu Pratiwi',
                'email' => 'ningsih.ayu@gmail.com',
                'hp'    => '083345678912',
                'alamat'=> 'Jl. Kenanga No. 32 RT 03',
                'prov'  => 'Kalimantan Selatan',
                'kota'  => 'Banjarmasin',
                'kec'   => 'Banjarmasin Utara',
                'kel'   => 'Sungai Andai',
                'pos'   => '70123',
            ],
            [
                'nama'  => 'Rizky Maulana',
                'email' => 'rizky.maulana@gmail.com',
                'hp'    => '089912345678',
                'alamat'=> 'Jl. Sam Ratulangi No. 45',
                'prov'  => 'Sulawesi Utara',
                'kota'  => 'Manado',
                'kec'   => 'Wenang',
                'kel'   => 'Pinaesaan',
                'pos'   => '95111',
            ],
            [
                'nama'  => 'Farida Nurul Huda',
                'email' => 'farida.nh@gmail.com',
                'hp'    => '081378901234',
                'alamat'=> 'Jl. Jenderal Sudirman No. 18',
                'prov'  => 'Sumatera Utara',
                'kota'  => 'Medan',
                'kec'   => 'Medan Baru',
                'kel'   => 'Petisah Tengah',
                'pos'   => '20152',
            ],
        ];

        $customerList = [];
        foreach ($customersRaw as $c) {
            $pelanggan = Pelanggan::firstOrCreate(
                ['email' => $c['email']],
                [
                    'nama_pelanggan'   => $c['nama'],
                    'no_hp'            => $c['hp'],
                    'status_pelanggan' => 'aktif',
                ]
            );

            $alamat = AlamatPelanggan::firstOrCreate(
                ['id_pelanggan' => $pelanggan->id_pelanggan, 'alamat_lengkap' => $c['alamat']],
                [
                    'nama_penerima'  => $c['nama'],
                    'no_hp_penerima' => $c['hp'],
                    'alamat_lengkap' => $c['alamat'],
                    'provinsi'       => $c['prov'],
                    'kota'           => $c['kota'],
                    'kecamatan'      => $c['kec'],
                    'kelurahan'      => $c['kel'],
                    'kode_pos'       => $c['pos'],
                    'catatan'        => null,
                    'status_alamat'  => 'aktif',
                ]
            );

            $customerList[] = ['pelanggan' => $pelanggan, 'alamat' => $alamat];
        }

        // ─── 4. DATA PESANAN DUMMY ────────────────────────────────────────────────
        $this->command->info('   → Membuat pesanan dummy...');

        $methods  = ['qris', 'gopay', 'ovo', 'dana', 'bank_transfer', 'bank_transfer', 'qris'];
        $couriers = ['JNE', 'J&T', 'SiCepat', 'AnterAja', 'Pos Indonesia'];
        $services = ['REG', 'OKE', 'YES', 'SUPER', 'Kilat Khusus'];
        $now = Carbon::now();
        $invoiceSeq = Transaksi::max('id_transaksi') ?? 0;
        $invoiceSeq += 200;

        /**
         * Skenario pesanan dummy:
         * Setiap item: [ daysAgo, status_pembayaran, status_transaksi, catatan ]
         */
        $scenarios = [
            // ── Pesanan SELESAI (dibayar & dikirim) ──────────────────────────────
            [0, 'paid', 'selesai'],
            [0, 'paid', 'selesai'],
            [1, 'paid', 'selesai'],
            [1, 'paid', 'selesai'],
            [2, 'paid', 'selesai'],
            [2, 'paid', 'selesai'],
            [3, 'paid', 'selesai'],
            [3, 'paid', 'selesai'],
            [5, 'paid', 'selesai'],
            [5, 'paid', 'selesai'],
            [7, 'paid', 'selesai'],
            [7, 'paid', 'selesai'],
            [10, 'paid', 'selesai'],
            [12, 'paid', 'selesai'],
            [14, 'paid', 'selesai'],
            [15, 'paid', 'selesai'],
            [18, 'paid', 'selesai'],
            [20, 'paid', 'selesai'],
            [25, 'paid', 'selesai'],
            [30, 'paid', 'selesai'],
            [35, 'paid', 'selesai'],
            [40, 'paid', 'selesai'],
            [45, 'paid', 'selesai'],
            [50, 'paid', 'selesai'],
            [55, 'paid', 'selesai'],
            [60, 'paid', 'selesai'],
            [65, 'paid', 'selesai'],
            [70, 'paid', 'selesai'],
            [75, 'paid', 'selesai'],
            [80, 'paid', 'selesai'],
            [85, 'paid', 'selesai'],
            [90, 'paid', 'selesai'],

            // ── Pesanan SEDANG BERJALAN ───────────────────────────────────────────
            [0, 'paid', 'diproses'],
            [0, 'paid', 'diproses'],
            [1, 'paid', 'dikemas'],
            [1, 'paid', 'dikemas'],
            [2, 'paid', 'siap_dikirim'],
            [2, 'paid', 'dikirim'],
            [3, 'paid', 'dikirim'],
            [3, 'paid', 'dikemas'],

            // ── Pesanan MENUNGGU PEMBAYARAN (belum dibayar) ──────────────────────
            [0, 'pending', 'menunggu_pembayaran'],
            [0, 'pending', 'menunggu_pembayaran'],
            [1, 'pending', 'menunggu_pembayaran'],
            [2, 'pending', 'menunggu_pembayaran'],

            // ── Pesanan DIBATALKAN / GAGAL ────────────────────────────────────────
            [3,  'cancelled', 'dibatalkan'],
            [7,  'cancelled', 'dibatalkan'],
            [15, 'failed',    'dibatalkan'],
            [10, 'expired',   'menunggu_pembayaran'],
            [20, 'expired',   'menunggu_pembayaran'],
        ];

        $createdCount = 0;
        foreach ($scenarios as $sc) {
            [$daysAgo, $statusPembayaran, $statusTransaksi] = $sc;

            // Waktu transaksi acak di jam kerja
            $txDate = $now->copy()
                ->subDays($daysAgo)
                ->setTime(rand(8, 20), rand(0, 59), rand(0, 59));

            $cust = $customerList[array_rand($customerList)];

            // Pilih 1-3 produk secara acak
            $shuffled = $productModels;
            shuffle($shuffled);
            $numItems = rand(1, 3);
            $itemsToBuy = [];
            $subtotal = 0;

            for ($i = 0; $i < $numItems; $i++) {
                $prod = $shuffled[$i];
                $qty  = rand(1, 5);
                $line = $prod->harga_product * $qty;
                $subtotal += $line;
                $itemsToBuy[] = [
                    'prod'     => $prod,
                    'qty'      => $qty,
                    'subtotal' => $line,
                ];
            }

            // Biaya pengiriman berbasis berat & jarak (simulasi)
            $ongkir = collect([15000, 18000, 20000, 22000, 25000, 28000, 30000])->random();
            $diskon  = 0;

            // Promo: pesanan > 100rb dapat diskon 10rb
            if ($subtotal >= 100000) {
                $diskon = 10000;
            }

            $total = $subtotal + $ongkir - $diskon;

            $invoiceSeq++;
            $invoiceNum = 'INV/' . $txDate->format('Ymd') . '/' . sprintf('%05d', $invoiceSeq);
            $metode     = $methods[array_rand($methods)];

            $paidAt = null;
            if (in_array($statusPembayaran, ['paid'])) {
                $paidAt = $txDate->copy()->addMinutes(rand(2, 25));
            }

            $expiredAt = null;
            if (in_array($statusPembayaran, ['pending', 'expired'])) {
                $expiredAt = $txDate->copy()->addHours(24);
            }

            // Midtrans simulasi
            $midtransOrderId = null;
            $midtransTxId    = null;
            $midtransType    = null;
            $midtransStatus  = null;

            if ($statusPembayaran === 'paid') {
                $midtransOrderId = 'LKSTR-' . $invoiceSeq . '-' . $txDate->format('Ymd');
                $midtransTxId    = Str_pad((string) rand(100000000, 999999999), 9, '0');
                $midtransType    = $metode === 'bank_transfer' ? 'bank_transfer' : 'e-wallet';
                $midtransStatus  = 'settlement';
            }

            $tx = Transaksi::create([
                'id_pelanggan'               => $cust['pelanggan']->id_pelanggan,
                'id_alamat'                  => $cust['alamat']->id_alamat,
                'nomor_invoice'              => $invoiceNum,
                'tanggal_transaksi'          => $txDate,
                'subtotal'                   => $subtotal,
                'biaya_pengiriman'           => $ongkir,
                'diskon'                     => $diskon,
                'total_pembayaran'           => $total,
                'metode_pembayaran'          => $metode,
                'status_pembayaran'          => $statusPembayaran,
                'status_transaksi'           => $statusTransaksi,
                'midtrans_order_id'          => $midtransOrderId,
                'midtrans_transaction_id'    => $midtransTxId,
                'midtrans_payment_type'      => $midtransType,
                'midtrans_transaction_status'=> $midtransStatus,
                'paid_at'                    => $paidAt,
                'expired_at'                 => $expiredAt,
            ]);

            // Status item mengikuti status transaksi
            $statusItem = match ($statusTransaksi) {
                'selesai'             => 'selesai',
                'dikirim'             => 'dikirim',
                'siap_dikirim'        => 'dikemas',
                'dikemas'             => 'dikemas',
                'diproses'            => 'diproses',
                'dibatalkan'          => 'dibatalkan',
                default               => 'dipesan',
            };

            foreach ($itemsToBuy as $item) {
                DetailTransaksi::create([
                    'id_transaksi'  => $tx->id_transaksi,
                    'id_product'    => $item['prod']->id_product,
                    'nama_product'  => $item['prod']->nama_product,
                    'harga_product' => $item['prod']->harga_product,
                    'jumlah'        => $item['qty'],
                    'berat_product' => $item['prod']->berat_product * $item['qty'],
                    'subtotal'      => $item['subtotal'],
                    'status_item'   => $statusItem,
                ]);
            }

            $createdCount++;
        }

        $this->command->info("✅ Selesai! Berhasil membuat {$createdCount} pesanan dummy.");
        $this->command->line('');
        $this->command->line('   Rincian status pesanan:');
        $this->command->line('   - Selesai          : ' . Transaksi::where('status_transaksi', 'selesai')->count());
        $this->command->line('   - Diproses         : ' . Transaksi::where('status_transaksi', 'diproses')->count());
        $this->command->line('   - Dikemas          : ' . Transaksi::where('status_transaksi', 'dikemas')->count());
        $this->command->line('   - Siap Dikirim     : ' . Transaksi::where('status_transaksi', 'siap_dikirim')->count());
        $this->command->line('   - Dikirim          : ' . Transaksi::where('status_transaksi', 'dikirim')->count());
        $this->command->line('   - Menunggu Bayar   : ' . Transaksi::where('status_transaksi', 'menunggu_pembayaran')->count());
        $this->command->line('   - Dibatalkan       : ' . Transaksi::where('status_transaksi', 'dibatalkan')->count());
        $this->command->line('');
        $this->command->line('   Total transaksi di DB: ' . Transaksi::count());
    }
}

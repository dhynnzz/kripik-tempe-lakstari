<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Pelanggan;
use App\Models\Transaksi;
use App\Models\Pengiriman;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function dashboardStats()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        // 1. Total Produk & Stok Habis
        $totalProduk = Product::count();
        $stokMenipis = Product::whereColumn('stok_product', '<=', 'stok_minimum')
                              ->where('stok_product', '>', 0)
                              ->get();
        $stokHabis = Product::where('stok_product', 0)->get();

        // 2. Pelanggan
        $totalPelanggan = Pelanggan::count();

        // 3. Pesanan
        $totalPesanan = Transaksi::count();
        $pesananHariIni = Transaksi::whereDate('tanggal_transaksi', $today)->count();

        // 4. Pendapatan (Paid only)
        $pendapatanTotal = Transaksi::where('status_pembayaran', 'paid')->sum('total_pembayaran');
        
        // 5. Status Pembayaran
        $payStatuses = [
            'Paid' => Transaksi::where('status_pembayaran', 'paid')->count(),
            'Pending' => Transaksi::where('status_pembayaran', 'pending')->count(),
            'Failed' => Transaksi::where('status_pembayaran', 'failed')->count(),
        ];

        // 6. Status Transaksi (Pesanan)
        $orderStatuses = [
            'Menunggu Pembayaran' => Transaksi::where('status_transaksi', 'menunggu_pembayaran')->count(),
            'Diproses' => Transaksi::where('status_transaksi', 'diproses')->count(),
            'Dikemas' => Transaksi::where('status_transaksi', 'dikemas')->count(),
            'Siap Dikirim' => Transaksi::where('status_transaksi', 'siap_dikirim')->count(),
            'Dikirim' => Transaksi::where('status_transaksi', 'dikirim')->count(),
            'Selesai' => Transaksi::where('status_transaksi', 'selesai')->count(),
            'Dibatalkan' => Transaksi::where('status_transaksi', 'dibatalkan')->count(),
        ];

        // 7. Pesanan Terbaru
        $recentOrders = Transaksi::with(['pelanggan', 'alamat', 'details.product', 'pengiriman'])
            ->orderBy('tanggal_transaksi', 'desc')
            ->take(30)
            ->get();

        // 8. Top 5 Produk Terlaris (Hanya transaksi lunas / dibayar)
        $topProducts = \DB::table('detail_transaksi')
            ->join('transaksi', 'detail_transaksi.id_transaksi', '=', 'transaksi.id_transaksi')
            ->join('products', 'detail_transaksi.id_product', '=', 'products.id_product')
            ->leftJoin('categories', 'products.id_category', '=', 'categories.id_category')
            ->select(
                'products.id_product',
                'products.nama_product',
                'products.foto_product',
                'products.harga_product',
                'products.varian_rasa',
                'categories.nama_category as kategori',
                \DB::raw('SUM(detail_transaksi.jumlah) as total_terjual'),
                \DB::raw('SUM(detail_transaksi.subtotal) as total_omset')
            )
            ->whereIn('transaksi.status_pembayaran', ['paid', 'settlement'])
            ->groupBy(
                'products.id_product',
                'products.nama_product',
                'products.foto_product',
                'products.harga_product',
                'products.varian_rasa',
                'categories.nama_category'
            )
            ->orderByDesc('total_terjual')
            ->take(5)
            ->get();

        // 8. Grafik Penjualan (Per Hari, Per Minggu, Per Bulan)
        $now = Carbon::now();
        $startOfYear = $now->copy()->startOfYear();
        $startOfWeek = $now->copy()->startOfWeek();
        $startOfData = $startOfWeek->lt($startOfYear) ? $startOfWeek : $startOfYear;
        
        $validTransactions = Transaksi::where('tanggal_transaksi', '>=', $startOfData)
            ->whereIn('status_pembayaran', ['paid', 'settlement'])
            ->get(['tanggal_transaksi', 'total_pembayaran']);

        // Sales per Month
        $salesPerMonth = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthDate = Carbon::create($now->year, $i, 1);
            $total = $validTransactions->filter(function($t) use ($i, $now) {
                $d = Carbon::parse($t->tanggal_transaksi);
                return $d->month === $i && $d->year === $now->year;
            })->sum('total_pembayaran');
            $salesPerMonth[] = ['label' => $monthDate->translatedFormat('M'), 'total' => $total];
        }

        // Sales per Week in current month
        $salesPerWeek = [];
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        $weekNumber = 1;
        $currDate = $startOfMonth->copy();
        while ($currDate->lte($endOfMonth)) {
            $endOfWeek = $currDate->copy()->endOfWeek();
            if ($endOfWeek->gt($endOfMonth)) {
                $endOfWeek = $endOfMonth->copy();
            }
            $currStr = $currDate->toDateString();
            $endStr = $endOfWeek->toDateString();
            $total = $validTransactions->filter(function($t) use ($currStr, $endStr) {
                $dStr = Carbon::parse($t->tanggal_transaksi)->toDateString();
                return $dStr >= $currStr && $dStr <= $endStr;
            })->sum('total_pembayaran');
            $salesPerWeek[] = ['label' => 'Mg ' . $weekNumber, 'total' => $total];
            $currDate = $endOfWeek->addDay();
            $weekNumber++;
        }

        // Sales per Day in current week
        $salesPerDay = [];
        for ($i = 0; $i < 7; $i++) {
            $date = $startOfWeek->copy()->addDays($i);
            $dStr = $date->toDateString();
            $total = $validTransactions->filter(function($t) use ($dStr) {
                return Carbon::parse($t->tanggal_transaksi)->toDateString() === $dStr;
            })->sum('total_pembayaran');
            $salesPerDay[] = ['label' => $date->translatedFormat('D'), 'total' => $total];
        }

        $salesChart = [
            'perDay' => $salesPerDay,
            'perWeek' => $salesPerWeek,
            'perMonth' => $salesPerMonth
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'totalProduk' => $totalProduk,
                    'totalPelanggan' => $totalPelanggan,
                    'totalPesanan' => $totalPesanan,
                    'pesananHariIni' => $pesananHariIni,
                    'pendapatan' => $pendapatanTotal,
                ],
                'stokMenipis' => $stokMenipis,
                'stokHabis' => $stokHabis,
                'payStatuses' => $payStatuses,
                'orderStatuses' => $orderStatuses,
                'recentOrders' => $recentOrders,
                'topProducts' => $topProducts,
                'salesChart' => $salesChart,
            ]
        ]);
    }

    public function analyticsReport(Request $request)
    {
        $period = $request->query('period', 'bulan'); // hari, minggu, bulan, tahun
        
        $query = Transaksi::query();
        
        $now = Carbon::now();
        if ($period === 'hari') {
            $query->whereDate('tanggal_transaksi', $now->toDateString());
        } elseif ($period === 'minggu') {
            $query->whereBetween('tanggal_transaksi', [$now->startOfWeek()->toDateString(), $now->endOfWeek()->toDateString()]);
        } elseif ($period === 'bulan') {
            $query->whereMonth('tanggal_transaksi', $now->month)
                  ->whereYear('tanggal_transaksi', $now->year);
        } elseif ($period === 'tahun') {
            $query->whereYear('tanggal_transaksi', $now->year);
        }

        // 1. Total Omset Penjualan (hanya pesanan yang dibayar/selesai)
        $omsetQuery = clone $query;
        $totalOmset = $omsetQuery->whereIn('status_pembayaran', ['paid', 'settlement'])->sum('total_pembayaran');

        // 2. Total Transaksi Selesai (atau dibayar)
        $transaksiSelesaiQuery = clone $query;
        $totalTransaksiSelesai = $transaksiSelesaiQuery->where('status_transaksi', 'selesai')->count();
        $totalSemuaTransaksi = (clone $query)->count();
        $persenValid = $totalSemuaTransaksi > 0 ? round(($totalTransaksiSelesai / $totalSemuaTransaksi) * 100, 1) : 0;

        // 3. Rata-rata Nilai Transaksi
        $rataRata = $totalTransaksiSelesai > 0 ? $totalOmset / $totalTransaksiSelesai : 0;

        // 4. Laporan Produk Terlaris & 5. Total Produk Terjual
        // Perlu join ke detail transaksi
        $produkTerjual = \DB::table('detail_transaksi')
            ->join('transaksi', 'detail_transaksi.id_transaksi', '=', 'transaksi.id_transaksi')
            ->join('products', 'detail_transaksi.id_product', '=', 'products.id_product')
            ->leftJoin('categories', 'products.id_category', '=', 'categories.id_category')
            ->select('products.nama_product', 'categories.nama_category as kategori', \DB::raw('SUM(detail_transaksi.jumlah) as total_terjual'))
            ->whereIn('transaksi.status_pembayaran', ['paid', 'settlement']);
            
        if ($period === 'hari') {
            $produkTerjual->whereDate('transaksi.tanggal_transaksi', $now->toDateString());
        } elseif ($period === 'minggu') {
            $produkTerjual->whereBetween('transaksi.tanggal_transaksi', [$now->copy()->startOfWeek()->toDateString(), $now->copy()->endOfWeek()->toDateString()]);
        } elseif ($period === 'bulan') {
            $produkTerjual->whereMonth('transaksi.tanggal_transaksi', $now->month)
                          ->whereYear('transaksi.tanggal_transaksi', $now->year);
        } elseif ($period === 'tahun') {
            $produkTerjual->whereYear('transaksi.tanggal_transaksi', $now->year);
        }
        
        $produkTerlaris = $produkTerjual->groupBy('products.id_product', 'products.nama_product', 'categories.nama_category')
            ->orderByDesc('total_terjual')
            ->take(5)
            ->get();
            
        $totalProdukTerjual = $produkTerlaris->sum('total_terjual'); // ini cuma top 5, untuk total asli hitung dari db:
        $totalProdukTerjualAsli = \DB::table('detail_transaksi')
            ->join('transaksi', 'detail_transaksi.id_transaksi', '=', 'transaksi.id_transaksi')
            ->whereIn('transaksi.status_pembayaran', ['paid', 'settlement']);
        
        if ($period === 'hari') {
            $totalProdukTerjualAsli->whereDate('transaksi.tanggal_transaksi', $now->toDateString());
        } elseif ($period === 'minggu') {
            $totalProdukTerjualAsli->whereBetween('transaksi.tanggal_transaksi', [$now->copy()->startOfWeek()->toDateString(), $now->copy()->endOfWeek()->toDateString()]);
        } elseif ($period === 'bulan') {
            $totalProdukTerjualAsli->whereMonth('transaksi.tanggal_transaksi', $now->month)
                                   ->whereYear('transaksi.tanggal_transaksi', $now->year);
        } elseif ($period === 'tahun') {
            $totalProdukTerjualAsli->whereYear('transaksi.tanggal_transaksi', $now->year);
        }
        $totalBungkus = $totalProdukTerjualAsli->sum('jumlah');

        // 6. Rekap Status Pengiriman
        $pengiriman = \DB::table('pengiriman')
            ->join('transaksi', 'pengiriman.id_transaksi', '=', 'transaksi.id_transaksi')
            ->select('pengiriman.status_pengiriman', \DB::raw('COUNT(pengiriman.id_pengiriman) as jumlah_transaksi'));
            
        if ($period === 'hari') {
            $pengiriman->whereDate('transaksi.tanggal_transaksi', $now->toDateString());
        } elseif ($period === 'minggu') {
            $pengiriman->whereBetween('transaksi.tanggal_transaksi', [$now->copy()->startOfWeek()->toDateString(), $now->copy()->endOfWeek()->toDateString()]);
        } elseif ($period === 'bulan') {
            $pengiriman->whereMonth('transaksi.tanggal_transaksi', $now->month)
                       ->whereYear('transaksi.tanggal_transaksi', $now->year);
        } elseif ($period === 'tahun') {
            $pengiriman->whereYear('transaksi.tanggal_transaksi', $now->year);
        }
        
        $rekapPengiriman = $pengiriman->groupBy('pengiriman.status_pengiriman')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_omset' => $totalOmset,
                'total_transaksi_selesai' => $totalTransaksiSelesai,
                'persen_valid' => $persenValid,
                'total_produk_terjual' => $totalBungkus,
                'rata_rata_transaksi' => $rataRata,
                'produk_terlaris' => $produkTerlaris,
                'rekap_pengiriman' => $rekapPengiriman
            ]
        ]);
    }

    public function salesChart(Request $request)
    {
        $period = $request->query('period', 'weekly'); // weekly, monthly, yearly
        $now = Carbon::now();
        $points = [];
        $previousRevenue = 0;

        if ($period === 'yearly') {
            $year = (int) $request->query('year', $now->year);

            $salesData = Transaksi::whereIn('status_pembayaran', ['paid', 'settlement'])
                ->whereYear('tanggal_transaksi', $year)
                ->selectRaw('MONTH(tanggal_transaksi) as m, SUM(total_pembayaran) as rev, COUNT(id_transaksi) as orders')
                ->groupBy('m')
                ->pluck('rev', 'm')
                ->all();

            $ordersData = Transaksi::whereIn('status_pembayaran', ['paid', 'settlement'])
                ->whereYear('tanggal_transaksi', $year)
                ->selectRaw('MONTH(tanggal_transaksi) as m, COUNT(id_transaksi) as orders')
                ->groupBy('m')
                ->pluck('orders', 'm')
                ->all();

            $monthNames = [
                1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
                5 => 'Mei', 6 => 'Jun', 7 => 'Jul', 8 => 'Agu',
                9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des'
            ];

            $monthFullNames = [
                1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
                5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
                9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
            ];

            for ($m = 1; $m <= 12; $m++) {
                $rev = (float) ($salesData[$m] ?? 0);
                $ord = (int) ($ordersData[$m] ?? 0);
                $points[] = [
                    'key' => (string) $m,
                    'label' => $monthNames[$m],
                    'full_label' => $monthFullNames[$m] . ' ' . $year,
                    'revenue' => $rev,
                    'orders' => $ord,
                ];
            }

            $previousRevenue = (float) Transaksi::whereIn('status_pembayaran', ['paid', 'settlement'])
                ->whereYear('tanggal_transaksi', $year - 1)
                ->sum('total_pembayaran');

        } elseif ($period === 'monthly') {
            $startDate = $now->copy()->subDays(29)->startOfDay();
            $endDate = $now->copy()->endOfDay();

            $salesData = Transaksi::whereIn('status_pembayaran', ['paid', 'settlement'])
                ->whereBetween('tanggal_transaksi', [$startDate->toDateTimeString(), $endDate->toDateTimeString()])
                ->selectRaw('DATE(tanggal_transaksi) as d, SUM(total_pembayaran) as rev, COUNT(id_transaksi) as orders')
                ->groupBy('d')
                ->get()
                ->keyBy('d');

            $dayIndo = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
            $fullDayIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

            $cursor = $startDate->copy();
            while ($cursor <= $endDate) {
                $dStr = $cursor->format('Y-m-d');
                $item = $salesData->get($dStr);
                $rev = (float) ($item ? $item->rev : 0);
                $ord = (int) ($item ? $item->orders : 0);

                $dayOfWeek = $cursor->dayOfWeek;

                $points[] = [
                    'key' => $dStr,
                    'label' => $cursor->format('d/m'),
                    'full_label' => $fullDayIndo[$dayOfWeek] . ', ' . $cursor->format('d M Y'),
                    'revenue' => $rev,
                    'orders' => $ord,
                ];

                $cursor->addDay();
            }

            $prevStart = $startDate->copy()->subDays(30);
            $prevEnd = $startDate->copy()->subSecond();
            $previousRevenue = (float) Transaksi::whereIn('status_pembayaran', ['paid', 'settlement'])
                ->whereBetween('tanggal_transaksi', [$prevStart->toDateTimeString(), $prevEnd->toDateTimeString()])
                ->sum('total_pembayaran');

        } else {
            // Weekly: last 7 days
            $startDate = $now->copy()->subDays(6)->startOfDay();
            $endDate = $now->copy()->endOfDay();

            $salesData = Transaksi::whereIn('status_pembayaran', ['paid', 'settlement'])
                ->whereBetween('tanggal_transaksi', [$startDate->toDateTimeString(), $endDate->toDateTimeString()])
                ->selectRaw('DATE(tanggal_transaksi) as d, SUM(total_pembayaran) as rev, COUNT(id_transaksi) as orders')
                ->groupBy('d')
                ->get()
                ->keyBy('d');

            $dayIndo = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
            $fullDayIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

            $cursor = $startDate->copy();
            while ($cursor <= $endDate) {
                $dStr = $cursor->format('Y-m-d');
                $item = $salesData->get($dStr);
                $rev = (float) ($item ? $item->rev : 0);
                $ord = (int) ($item ? $item->orders : 0);

                $dayOfWeek = $cursor->dayOfWeek;

                $points[] = [
                    'key' => $dStr,
                    'label' => $dayIndo[$dayOfWeek] . ' (' . $cursor->format('d/m') . ')',
                    'full_label' => $fullDayIndo[$dayOfWeek] . ', ' . $cursor->format('d M Y'),
                    'revenue' => $rev,
                    'orders' => $ord,
                ];

                $cursor->addDay();
            }

            $prevStart = $startDate->copy()->subDays(7);
            $prevEnd = $startDate->copy()->subSecond();
            $previousRevenue = (float) Transaksi::whereIn('status_pembayaran', ['paid', 'settlement'])
                ->whereBetween('tanggal_transaksi', [$prevStart->toDateTimeString(), $prevEnd->toDateTimeString()])
                ->sum('total_pembayaran');
        }

        $totalRevenue = array_sum(array_column($points, 'revenue'));
        $totalOrders = array_sum(array_column($points, 'orders'));
        $averageOrder = $totalOrders > 0 ? round($totalRevenue / $totalOrders) : 0;

        $growthRate = 0;
        if ($previousRevenue > 0) {
            $growthRate = round((($totalRevenue - $previousRevenue) / $previousRevenue) * 100, 1);
        } elseif ($totalRevenue > 0) {
            $growthRate = 100.0;
        }

        $highestRevenue = 0;
        $highestLabel = '';
        foreach ($points as $p) {
            if ($p['revenue'] > $highestRevenue) {
                $highestRevenue = $p['revenue'];
                $highestLabel = $p['full_label'];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'points' => $points,
                'summary' => [
                    'total_revenue' => $totalRevenue,
                    'total_orders' => $totalOrders,
                    'average_order' => $averageOrder,
                    'growth_rate' => $growthRate,
                    'previous_revenue' => $previousRevenue,
                    'highest_revenue' => $highestRevenue,
                    'highest_label' => $highestLabel,
                ]
            ]
        ]);
    }
}

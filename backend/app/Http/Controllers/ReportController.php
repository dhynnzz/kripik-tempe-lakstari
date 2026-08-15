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
        $recentOrders = Transaksi::with('pelanggan')
            ->orderBy('tanggal_transaksi', 'desc')
            ->take(10)
            ->get();

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
            ]
        ]);
    }
}

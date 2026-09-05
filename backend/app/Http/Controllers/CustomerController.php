<?php

namespace App\Http\Controllers;

use App\Models\Pelanggan;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    // [ADMIN] Ambil Semua Pelanggan dengan Filter & Pencarian
    public function index(Request $request)
    {
        $query = Pelanggan::withCount('transaksi')
            ->with(['transaksi' => function ($q) {
                $q->orderBy('created_at', 'desc')->take(5);
            }, 'alamat']);

        // Search by name, phone, or email
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('nama_pelanggan', 'like', "%{$search}%")
                  ->orWhere('no_hp', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $st = strtolower($request->status);
            if ($st === 'aktif') {
                $query->whereIn('status_pelanggan', ['aktif', 'Aktif']);
            } else if ($st === 'blacklist' || $st === 'nonaktif') {
                $query->whereIn('status_pelanggan', ['blacklist', 'Blacklist', 'nonaktif', 'Nonaktif']);
            } else {
                $query->where('status_pelanggan', $request->status);
            }
        }

        $perPage = (int) ($request->per_page ?? 10);
        $customers = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Summary stats untuk cards metric
        $totalCustomers = Pelanggan::count();
        $activeCustomers = Pelanggan::whereIn('status_pelanggan', ['aktif', 'Aktif'])->count();
        $blacklistedCustomers = Pelanggan::whereIn('status_pelanggan', ['blacklist', 'Blacklist', 'nonaktif', 'Nonaktif'])->count();
        $totalOrders = \App\Models\Transaksi::count();

        return response()->json([
            'success' => true,
            'data' => $customers,
            'stats' => [
                'total' => $totalCustomers,
                'active' => $activeCustomers,
                'blacklisted' => $blacklistedCustomers,
                'total_orders' => $totalOrders,
            ]
        ]);
    }

    // [ADMIN] Ubah Status Pelanggan (Blacklist / Aktif)
    public function updateStatus(Request $request, $id)
    {
        $pelanggan = Pelanggan::findOrFail($id);
        $pelanggan->status_pelanggan = $request->status_pelanggan;
        $pelanggan->save();

        return response()->json(['success' => true, 'message' => 'Status pelanggan diperbarui', 'data' => $pelanggan]);
    }
}

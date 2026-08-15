<?php

namespace App\Http\Controllers;

use App\Models\Pelanggan;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    // [ADMIN] Ambil Semua Pelanggan
    public function index()
    {
        $customers = Pelanggan::withCount('transaksi')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json(['success' => true, 'data' => $customers]);
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

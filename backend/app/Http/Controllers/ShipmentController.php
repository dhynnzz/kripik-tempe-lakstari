<?php

namespace App\Http\Controllers;

use App\Models\Pengiriman;
use Illuminate\Http\Request;

class ShipmentController extends Controller
{
    // [ADMIN] Ambil Semua Data Pengiriman
    public function index()
    {
        $shipments = Pengiriman::with(['transaksi.pelanggan'])->orderBy('created_at', 'desc')->paginate(10);
        return response()->json(['success' => true, 'data' => $shipments]);
    }

    // [ADMIN] Update Resi dan Status Pengiriman
    public function update(Request $request, $id)
    {
        $pengiriman = Pengiriman::findOrFail($id);
        
        if ($request->has('nomor_resi')) {
            $pengiriman->nomor_resi = $request->nomor_resi;
            if (!$pengiriman->shipped_at) {
                $pengiriman->shipped_at = now();
            }
        }
        
        if ($request->has('status_pengiriman')) {
            $pengiriman->status_pengiriman = $request->status_pengiriman;
            if ($request->status_pengiriman == 'Terkirim' || $request->status_pengiriman == 'Selesai') {
                $pengiriman->completed_at = now();
            }
        }

        $pengiriman->save();

        return response()->json(['success' => true, 'message' => 'Data pengiriman diperbarui', 'data' => $pengiriman]);
    }
}

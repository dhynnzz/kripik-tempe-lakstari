<?php

namespace App\Http\Controllers;

use App\Models\Pengiriman;
use Illuminate\Http\Request;

class ShipmentController extends Controller
{
    // [ADMIN] Ambil Semua Data Pengiriman
    public function index()
    {
        $shipments = Pengiriman::with(['transaksi.pelanggan', 'transaksi.details.product', 'transaksi.alamat', 'alamat'])->orderBy('created_at', 'desc')->paginate(10);
        return response()->json(['success' => true, 'data' => $shipments]);
    }

    // [ADMIN] Update Resi dan Status Pengiriman
    public function update(Request $request, $id)
    {
        $pengiriman = Pengiriman::findOrFail($id);
        
        if ($request->has('nomor_resi')) {
            $pengiriman->nomor_resi = $request->nomor_resi;
            if (!$pengiriman->tanggal_dikirim) {
                $pengiriman->tanggal_dikirim = now();
            }
        }
        
        if ($request->has('status_pengiriman')) {
            $pengiriman->status_pengiriman = $request->status_pengiriman;
            
            $status = strtolower($request->status_pengiriman);

            if ($status == 'terkirim' || $status == 'selesai') {
                $pengiriman->tanggal_selesai = now();
            }

            // Jika status diubah jadi Dibatalkan, batalkan juga di Biteship
            if ($status == 'dibatalkan') {
                \App\Http\Controllers\BiteshipController::cancelOrder($pengiriman);
                
                // Ubah juga status transaksi induknya jika perlu
                if ($pengiriman->transaksi) {
                    $pengiriman->transaksi->status_transaksi = 'dibatalkan';
                    $pengiriman->transaksi->save();
                }
            }
        }

        $pengiriman->save();

        return response()->json(['success' => true, 'message' => 'Data pengiriman diperbarui', 'data' => $pengiriman]);
    }
}

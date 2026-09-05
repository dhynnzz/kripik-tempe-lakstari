<?php

namespace App\Http\Controllers;

use App\Models\Pengiriman;
use App\Models\Product;
use Illuminate\Http\Request;

class ShipmentController extends Controller
{
    // [ADMIN] Ambil Semua Data Pengiriman
    public function index()
    {
        $shipments = Pengiriman::with(['transaksi.pelanggan', 'transaksi.details.product', 'transaksi.alamat', 'alamat'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json(['success' => true, 'data' => $shipments]);
    }

    // [ADMIN] Update Resi dan Status Pengiriman
    public function update(Request $request, $id)
    {
        $pengiriman = Pengiriman::with(['transaksi.details'])->findOrFail($id);
        $transaksi = $pengiriman->transaksi;

        if ($request->has('nomor_resi')) {
            $pengiriman->nomor_resi = $request->nomor_resi;
        }

        if ($request->has('status_pengiriman')) {
            $rawStatus = strtolower(str_replace(' ', '_', $request->status_pengiriman));
            
            // Normalisasi status
            if ($rawStatus === 'selesai' || $rawStatus === 'terkirim') {
                $status = 'terkirim';
            } elseif ($rawStatus === 'dikirim' || $rawStatus === 'dalam_perjalanan') {
                $status = 'dalam_perjalanan';
            } else {
                $status = $rawStatus;
            }

            $pengiriman->status_pengiriman = $status;

            // 1. Jika status = dalam_perjalanan (Paket Diambil Kurir)
            if ($status === 'dalam_perjalanan') {
                if (!$pengiriman->tanggal_dikirim) {
                    $pengiriman->tanggal_dikirim = now();
                }
                if ($transaksi && $transaksi->status_transaksi !== 'dikirim') {
                    $transaksi->status_transaksi = 'dikirim';
                    $transaksi->save();
                }
            }
            // 2. Jika status = terkirim (Paket Sampai di Pelanggan)
            elseif ($status === 'terkirim') {
                if (!$pengiriman->tanggal_selesai) {
                    $pengiriman->tanggal_selesai = now();
                }
                if (!$pengiriman->tanggal_dikirim) {
                    $pengiriman->tanggal_dikirim = now();
                }
                if ($transaksi && $transaksi->status_transaksi !== 'selesai') {
                    $transaksi->status_transaksi = 'selesai';
                    $transaksi->save();
                }
            }
            // 3. Jika status = dibatalkan
            elseif ($status === 'dibatalkan') {
                \App\Http\Controllers\BiteshipController::cancelOrder($pengiriman);

                if ($transaksi && $transaksi->status_transaksi !== 'dibatalkan') {
                    $transaksi->status_transaksi = 'dibatalkan';
                    if ($transaksi->status_pembayaran !== 'paid') {
                        $transaksi->status_pembayaran = 'cancelled';
                    }
                    $transaksi->save();

                    // Kembalikan stok produk
                    foreach ($transaksi->details as $detail) {
                        $product = Product::find($detail->id_product);
                        if ($product) {
                            $product->increment('stok_product', $detail->jumlah);
                            if ($product->status_product == 'habis') {
                                $product->update(['status_product' => 'aktif']);
                            }
                        }
                    }
                }
            }
            // 4. Jika status = menunggu_pickup
            elseif ($status === 'menunggu_pickup') {
                if ($transaksi && $transaksi->status_transaksi === 'menunggu_pembayaran') {
                    $transaksi->status_transaksi = 'diproses';
                    $transaksi->save();
                }
            }
        }

        $pengiriman->save();

        return response()->json([
            'success' => true,
            'message' => 'Data pengiriman berhasil diperbarui dan disinkronkan',
            'data' => $pengiriman->load(['transaksi.pelanggan', 'transaksi.details.product', 'alamat'])
        ]);
    }
}

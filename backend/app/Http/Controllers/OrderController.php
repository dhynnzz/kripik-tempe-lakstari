<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\DetailTransaksi;
use App\Models\Pelanggan;
use App\Models\AlamatPelanggan;
use App\Models\Pengiriman;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    // [PUBLIC] Proses Checkout dari Pengguna
    public function checkout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_pelanggan' => 'required|string|max:100',
            'no_hp' => 'required|string|max:20',
            'email' => 'nullable|email',
            'alamat_lengkap' => 'required|string',
            'kecamatan' => 'required|string',
            'kota' => 'required|string',
            'provinsi' => 'required|string',
            'kode_pos' => 'required|string',
            'items' => 'required|array',
            'items.*.id_product' => 'required|exists:products,id_product',
            'items.*.qty' => 'required|integer|min:1',
            'biaya_pengiriman' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // 1. Simpan atau Temukan Pelanggan
            $pelanggan = Pelanggan::firstOrCreate(
                ['no_hp' => $request->no_hp],
                ['nama_pelanggan' => $request->nama_pelanggan, 'email' => $request->email]
            );

            // 2. Simpan Alamat
            $alamat = AlamatPelanggan::create([
                'id_pelanggan' => $pelanggan->id_pelanggan,
                'label_alamat' => 'Utama',
                'nama_penerima' => $request->nama_pelanggan,
                'no_hp_penerima' => $request->no_hp,
                'alamat_lengkap' => $request->alamat_lengkap,
                'kelurahan' => $request->kelurahan ?? '-',
                'kecamatan' => $request->kecamatan,
                'kota' => $request->kota,
                'provinsi' => $request->provinsi,
                'kode_pos' => $request->kode_pos,
                'is_utama' => 1
            ]);

            // 3. Buat Transaksi
            $subtotal = 0;
            $invoice = 'INV-' . date('Ymd') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);

            $transaksi = Transaksi::create([
                'id_pelanggan' => $pelanggan->id_pelanggan,
                'id_alamat' => $alamat->id_alamat,
                'nomor_invoice' => $invoice,
                'tanggal_transaksi' => now(),
                'subtotal' => 0, // akan diupdate setelah hitung detail
                'biaya_pengiriman' => $request->biaya_pengiriman,
                'diskon' => 0,
                'total_pembayaran' => 0,
                'metode_pembayaran' => 'Transfer Bank',
                'status_pembayaran' => 'pending',
                'status_transaksi' => 'menunggu_pembayaran',
            ]);

            // 4. Buat Detail Transaksi & Kurangi Stok
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['id_product']);
                
                // Cek Stok
                if ($product->stok_product < $item['qty']) {
                    throw new \Exception("Stok untuk produk {$product->nama_product} tidak mencukupi.");
                }

                $harga = $product->harga_product;
                $subtotal_item = $harga * $item['qty'];
                $subtotal += $subtotal_item;

                DetailTransaksi::create([
                    'id_transaksi' => $transaksi->id_transaksi,
                    'id_product' => $product->id_product,
                    'nama_product' => $product->nama_product,
                    'harga_product' => $harga,
                    'berat_product' => $product->berat_product,
                    'jumlah' => $item['qty'],
                    'subtotal' => $subtotal_item,
                ]);

                // Kurangi Stok Produk
                $product->decrement('stok_product', $item['qty']);
                if ($product->stok_product == 0) {
                    $product->update(['status_product' => 'habis']);
                }
            }

            // Update Total Transaksi
            $transaksi->update([
                'subtotal' => $subtotal,
                'total_pembayaran' => $subtotal + $request->biaya_pengiriman,
            ]);

            // 5. Buat Pengiriman (Draft)
            Pengiriman::create([
                'id_transaksi' => $transaksi->id_transaksi,
                'id_pelanggan' => $pelanggan->id_pelanggan,
                'id_alamat' => $alamat->id_alamat,
                'kurir' => 'J&T Express', // Default atau dari request
                'layanan_kurir' => 'REG',
                'status_pengiriman' => 'menunggu_pickup',
                'biaya_pengiriman' => $request->biaya_pengiriman,
                'berat_total' => 1000 // Simulasi 1kg
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat, Menunggu Pembayaran',
                'invoice' => $invoice,
                'data' => $transaksi
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    // [ADMIN] Ambil Semua Pesanan
    public function index()
    {
        $orders = Transaksi::with(['pelanggan', 'details.product', 'pengiriman'])->orderBy('tanggal_transaksi', 'desc')->get();
        return response()->json(['success' => true, 'data' => $orders]);
    }

    // [ADMIN] Update Status Pesanan / Pembayaran
    public function updateStatus(Request $request, $id)
    {
        $transaksi = Transaksi::findOrFail($id);

        if ($request->has('status_pembayaran')) {
            $transaksi->status_pembayaran = $request->status_pembayaran;
            if ($request->status_pembayaran == 'Paid') {
                $transaksi->paid_at = now();
                if ($transaksi->status_transaksi == 'Menunggu Pembayaran') {
                    $transaksi->status_transaksi = 'Diproses';
                }
            }
        }

        if ($request->has('status_transaksi')) {
            $transaksi->status_transaksi = $request->status_transaksi;
        }

        $transaksi->save();

        return response()->json(['success' => true, 'message' => 'Status pesanan diperbarui', 'data' => $transaksi]);
    }
}

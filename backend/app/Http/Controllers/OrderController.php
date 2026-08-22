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
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

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
            'kurir' => 'nullable|string',
            'layanan_kurir' => 'nullable|string',
            'payment_method' => 'required|string|in:bca_va,bni_va,bri_va,mandiri_va,qris',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // 1. Simpan atau Temukan Pelanggan
            $pelanggan = null;
            if (!empty($request->email)) {
                $pelanggan = Pelanggan::where('email', $request->email)->first();
            }
            if (!$pelanggan) {
                $pelanggan = Pelanggan::where('no_hp', $request->no_hp)->first();
            }
            
            if (!$pelanggan) {
                $pelanggan = Pelanggan::create([
                    'no_hp' => $request->no_hp,
                    'nama_pelanggan' => $request->nama_pelanggan,
                    'email' => $request->email
                ]);
            } else {
                // Optional: Update nama_pelanggan if it changed
                $pelanggan->update([
                    'nama_pelanggan' => $request->nama_pelanggan,
                ]);
            }

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
                'metode_pembayaran' => $request->payment_method,
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
                'kurir' => $request->kurir ?? 'JNE',
                'layanan_kurir' => $request->layanan_kurir ?? 'Reguler',
                'status_pengiriman' => 'menunggu_pickup',
                'biaya_pengiriman' => $request->biaya_pengiriman,
                'berat_total' => 1000 // Simulasi 1kg
            ]);

            DB::commit();

            // Midtrans Configuration
            Config::$serverKey = config('midtrans.server_key');
            Config::$isProduction = config('midtrans.is_production');
            Config::$isSanitized = config('midtrans.is_sanitized');
            Config::$is3ds = config('midtrans.is_3ds');

            $item_details = [];
            foreach ($transaksi->details as $detail) {
                $item_details[] = [
                    'id'       => $detail->id_product,
                    'price'    => $detail->harga_product,
                    'quantity' => $detail->jumlah,
                    'name'     => $detail->nama_product,
                ];
            }
            // Tambah ongkir
            $item_details[] = [
                'id' => 'SHIPPING',
                'price' => $request->biaya_pengiriman,
                'quantity' => 1,
                'name' => 'Biaya Pengiriman'
            ];

            $enabledPayments = [];
            if ($request->payment_method === 'bca_va') {
                $enabledPayments = ['bca_va'];
            } elseif ($request->payment_method === 'bni_va') {
                $enabledPayments = ['bni_va'];
            } elseif ($request->payment_method === 'bri_va') {
                $enabledPayments = ['bri_va'];
            } elseif ($request->payment_method === 'mandiri_va') {
                $enabledPayments = ['echannel'];
            } elseif ($request->payment_method === 'qris') {
                $enabledPayments = ['qris'];
            }

            $params = [
                'transaction_details' => [
                    'order_id' => $invoice,
                    'gross_amount' => $transaksi->total_pembayaran,
                ],
                'customer_details' => [
                    'first_name' => $pelanggan->nama_pelanggan,
                    'email' => $pelanggan->email ?: 'customer@example.com', // fallback
                    'phone' => $pelanggan->no_hp,
                ],
                'item_details' => $item_details,
                'enabled_payments' => $enabledPayments,
                'callbacks' => [
                    'finish' => env('FRONTEND_URL', 'http://localhost:5173'),
                    'error' => env('FRONTEND_URL', 'http://localhost:5173'),
                    'unfinish' => env('FRONTEND_URL', 'http://localhost:5173')
                ]
            ];

            $snapToken = \Midtrans\Snap::getSnapToken($params);

            // Simpan tipe pembayaran dan token ke database
            $transaksi->payment_type = $request->payment_method;
            $transaksi->snap_token = $snapToken;
            $transaksi->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat, Menunggu Pembayaran',
                'invoice' => $transaksi->nomor_invoice,
                'payment_type' => $transaksi->payment_type,
                'snap_token' => $snapToken,
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

    // [PUBLIC] Webhook dari Midtrans
    public function paymentNotification(Request $request)
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');

        try {
            $notif = new Notification();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $transaction = $notif->transaction_status;
        $type = $notif->payment_type;
        $order_id = $notif->order_id;
        $fraud = $notif->fraud_status;

        $order = Transaksi::where('nomor_invoice', $order_id)->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order->midtrans_payment_type = $type;
        $order->midtrans_transaction_id = $notif->transaction_id;
        $order->midtrans_transaction_status = $transaction;

        $previousStatus = $order->status_transaksi;

        if ($transaction == 'capture') {
            if ($type == 'credit_card') {
                if ($fraud == 'challenge') {
                    $order->status_pembayaran = 'pending';
                } else {
                    $order->status_pembayaran = 'paid';
                    $order->status_transaksi = 'diproses';
                    $order->paid_at = now();
                    
                    // Panggil Biteship Create Order
                    \App\Http\Controllers\BiteshipController::createOrder($order);
                }
            }
        } else if ($transaction == 'settlement') {
            $order->status_pembayaran = 'paid';
            $order->status_transaksi = 'diproses';
            if (!$order->paid_at) {
                $order->paid_at = now();
            }
            
            // Panggil Biteship Create Order
            \App\Http\Controllers\BiteshipController::createOrder($order);
        } else if ($transaction == 'pending') {
            $order->status_pembayaran = 'pending';
        } else if (in_array($transaction, ['deny', 'expire', 'cancel'])) {
            $order->status_pembayaran = $transaction == 'deny' ? 'failed' : ($transaction == 'expire' ? 'expired' : 'cancelled');
            $order->status_transaksi = 'dibatalkan';
            
            if ($previousStatus !== 'dibatalkan') {
                foreach ($order->details as $detail) {
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

        $order->save();

        return response()->json(['message' => 'Notification handled']);
    }

    // [PUBLIC] Fallback untuk Localhost (karena webhook Midtrans tidak bisa hit localhost)
    public function paymentSuccessFallback(Request $request)
    {
        $order = Transaksi::where('nomor_invoice', $request->order_id)->first();
        
        if ($order && $order->status_transaksi == 'menunggu_pembayaran') {
            $order->status_pembayaran = 'paid';
            $order->status_transaksi = 'diproses';
            $order->paid_at = now();
            $order->save();
            
            // Panggil Biteship Create Order
            \App\Http\Controllers\BiteshipController::createOrder($order);
        }

        return response()->json(['success' => true]);
    }
    // [PUBLIC] Fitur Cek Pesanan
    public function trackOrder(Request $request)
    {
        $request->validate([
            'nomor_invoice' => 'required|string',
            'no_hp' => 'required|string',
        ]);

        $order = Transaksi::with(['details.product', 'pengiriman'])
            ->where('nomor_invoice', $request->nomor_invoice)
            ->whereHas('pelanggan', function($q) use ($request) {
                $q->where('no_hp', $request->no_hp);
            })
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan. Pastikan Nomor Invoice dan Nomor WA sudah benar.'
            ], 404);
        }

        // Realtime Sync dengan Midtrans jika status masih pending
        if ($order->status_pembayaran === 'pending' || $order->status_transaksi === 'menunggu_pembayaran') {
            try {
                Config::$serverKey = config('midtrans.server_key');
                Config::$isProduction = config('midtrans.is_production');
                
                $midtransStatus = \Midtrans\Transaction::status($order->nomor_invoice);
                
                $transaction = $midtransStatus->transaction_status;
                $type = $midtransStatus->payment_type;
                $fraud = $midtransStatus->fraud_status ?? null;
                
                $order->midtrans_payment_type = $type;
                $order->midtrans_transaction_id = $midtransStatus->transaction_id ?? null;
                $order->midtrans_transaction_status = $transaction;
                
                $previousStatusTrack = $order->status_transaksi;
                
                if ($transaction == 'capture') {
                    if ($type == 'credit_card') {
                        if ($fraud == 'challenge') {
                            $order->status_pembayaran = 'pending';
                        } else {
                            $order->status_pembayaran = 'paid';
                            $order->status_transaksi = 'diproses';
                            $order->paid_at = now();
                        }
                    }
                } else if ($transaction == 'settlement') {
                    $order->status_pembayaran = 'paid';
                    $order->status_transaksi = 'diproses';
                    if (!$order->paid_at) {
                        $order->paid_at = now();
                    }
                } else if ($transaction == 'pending') {
                    $order->status_pembayaran = 'pending';
                } else if (in_array($transaction, ['deny', 'expire', 'cancel'])) {
                    $order->status_pembayaran = $transaction == 'deny' ? 'failed' : ($transaction == 'expire' ? 'expired' : 'cancelled');
                    $order->status_transaksi = 'dibatalkan';
                    
                    if ($previousStatusTrack !== 'dibatalkan') {
                        foreach ($order->details as $detail) {
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
                
                $order->save();
            } catch (\Exception $e) {
                // Abaikan jika error dari Midtrans (misal pesanan belum tercatat di midtrans)
            }
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }
}

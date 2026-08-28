<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class BiteshipController extends Controller
{
    public function getRates(Request $request)
    {
        $request->validate([
            'destination_postal_code' => 'required|string',
            'items' => 'required|array',
        ]);

        $apiKey = env('BITESHIP_API_KEY');
        $originPostalCode = env('BITESHIP_ORIGIN_POSTAL_CODE', '12440'); // Default to a valid origin if missing

        if (!$apiKey) {
            return response()->json(['success' => false, 'message' => 'Biteship API Key not configured'], 500);
        }

        // Calculate total weight and build items payload
        // Biteship expects weight in grams
        $biteshipItems = [];
        foreach ($request->items as $item) {
            $biteshipItems[] = [
                'name' => $item['name'] ?? 'Produk',
                'description' => $item['name'] ?? 'Produk',
                'value' => $item['price'] ?? 0,
                'weight' => $item['weight'] ?? 150, // assume 150g per item if not specified
                'quantity' => $item['quantity'] ?? 1
            ];
        }

        $payload = [
            'origin_postal_code' => $originPostalCode,
            'destination_postal_code' => $request->destination_postal_code,
            'couriers' => 'jne,jnt,sicepat', // default couriers
            'items' => $biteshipItems
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.biteship.com/v1/rates/couriers', $payload);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'data' => $response->json()
                ]);
            }
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendapatkan tarif ongkir dari Biteship.',
                'error' => $response->json()
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * [SECURITY] Validasi biaya pengiriman langsung ke Biteship
     * Mencegah "Ongkir Tampering" dari frontend
     */
    public static function validateShippingCost($destinationPostalCode, $kurir, $layanan, $claimedCost, $items)
    {
        $apiKey = env('BITESHIP_API_KEY');
        $originPostalCode = env('BITESHIP_ORIGIN_POSTAL_CODE', '12440');

        if (!$apiKey) return true; // Skip validasi jika API key belum diset (mode dev tanpa biteship)

        $biteshipItems = [];
        foreach ($items as $item) {
            $biteshipItems[] = [
                'name' => $item->nama_product ?? 'Produk',
                'description' => $item->nama_product ?? 'Produk',
                'value' => (int) $item->harga_product,
                'weight' => (int) ($item->berat_product ?? 150),
                'quantity' => (int) $item->jumlah
            ];
        }

        $payload = [
            'origin_postal_code' => $originPostalCode,
            'destination_postal_code' => $destinationPostalCode,
            'couriers' => strtolower($kurir),
            'items' => $biteshipItems
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.biteship.com/v1/rates/couriers', $payload);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['pricing']) && is_array($data['pricing'])) {
                    foreach ($data['pricing'] as $pricing) {
                        if (strtolower($pricing['courier_service_code']) === strtolower($layanan) || 
                            strtolower($pricing['courier_name']) === strtolower($kurir)) {
                            
                            $actualCost = $pricing['price'];
                            
                            // Toleransi perbedaan harga (misal karena asuransi/pembulatan), beri margin Rp 1.000
                            if (abs($actualCost - $claimedCost) <= 1000) {
                                return true; // Valid
                            } else {
                                // Harga dimanipulasi
                                return $actualCost; // Return the correct actual cost
                            }
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            // Jika API gagal, kita bisa memilih untuk membiarkan transaksi lolos atau digagalkan.
            // Untuk saat ini kita anggap lolos agar transaksi tidak terblokir karena Biteship down.
        }

        // Return true jika tidak ditemukan atau gagal ngecek, biar gak block pembelian (opsional)
        // Idealnya return error/false
        return true; 
    }

    /**
     * Memanggil Biteship POST /v1/orders
     */
    public static function createOrder(\App\Models\Transaksi $transaksi)
    {
        try {
            $pengiriman = $transaksi->pengiriman;
            if (!$pengiriman) return false;

            // Jika sudah punya ID biteship, jangan buat ulang
            if ($pengiriman->betship_order_id) return true;

            $alamat = $transaksi->alamat;
            $pelanggan = $transaksi->pelanggan;

            $items = [];
            foreach ($transaksi->details as $detail) {
                $items[] = [
                    'name' => $detail->nama_product,
                    'description' => $detail->nama_product,
                    'value' => (int) $detail->harga_product,
                    'quantity' => (int) $detail->jumlah,
                    'weight' => (int) ($detail->berat_product ?? 150)
                ];
            }

            $payload = [
                // Data Pengirim (Shipper) - Wajib untuk Biteship
                'shipper_contact_name' => 'Kripik Tempe Lakstari',
                'shipper_contact_phone' => '081234567890',
                'shipper_contact_email' => 'admin@lakstari.com',
                'shipper_organization' => 'Kripik Tempe Lakstari',
                
                // Data Asal Penjemputan (Origin)
                'origin_contact_name' => 'Kripik Tempe Lakstari',
                'origin_contact_phone' => '081234567890', // Bisa disesuaikan
                'origin_address' => 'Toko Kripik Tempe Lakstari',
                'origin_postal_code' => (int) env('BITESHIP_ORIGIN_POSTAL_CODE', 12440),
                
                // Data Penerima (Destination)
                'destination_contact_name' => $alamat->nama_penerima ?? $pelanggan->nama_pelanggan,
                'destination_contact_phone' => $alamat->no_hp_penerima ?? $pelanggan->no_hp,
                'destination_address' => $alamat->alamat_lengkap . ', Kec. ' . $alamat->kecamatan . ', Kota ' . $alamat->kota,
                'destination_postal_code' => (int) $alamat->kode_pos,
                
                // Informasi Kurir
                'courier_company' => strtolower($pengiriman->kurir),
                'courier_type' => strtolower($pengiriman->layanan_kurir),
                'delivery_type' => 'later',
                'delivery_date' => date('Y-m-d', strtotime('+1 day')), // Besok
                'delivery_time' => '09:00',
                
                // Produk
                'items' => $items,
            ];

            $response = Http::withHeaders([
                'Authorization' => env('BITESHIP_API_KEY'),
                'Content-Type' => 'application/json'
            ])->post('https://api.biteship.com/v1/orders', $payload);

            if ($response->successful()) {
                $data = $response->json();
                $pengiriman->betship_order_id = $data['id'] ?? null;
                $pengiriman->status_pengiriman = 'menunggu_pickup';
                
                if (isset($data['courier']['waybill_id'])) {
                    $pengiriman->nomor_resi = $data['courier']['waybill_id'];
                }
                
                $pengiriman->save();
                return true;
            }

            \Illuminate\Support\Facades\Log::error('Biteship Create Order Error: ' . $response->body());
            return false;

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Biteship Create Order Exception: ' . $e->getMessage());
            return false;
        }
    }
}

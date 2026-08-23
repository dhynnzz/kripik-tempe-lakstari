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

            // Fallback MOCK DATA jika API Biteship gagal (misal: Saldo Habis)
            // Ini membantu agar proses testing dan demo UI tetap bisa berjalan
            return response()->json([
                'success' => true,
                'is_mock' => true,
                'data' => [
                    'pricing' => [
                        [
                            'courier_name' => 'jne',
                            'courier_service_name' => 'REG',
                            'duration' => '2 - 3 Hari',
                            'price' => 25000
                        ],
                        [
                            'courier_name' => 'jnt',
                            'courier_service_name' => 'EZ',
                            'duration' => '2 - 4 Hari',
                            'price' => 23000
                        ],
                        [
                            'courier_name' => 'sicepat',
                            'courier_service_name' => 'HALU',
                            'duration' => '3 - 5 Hari',
                            'price' => 20000
                        ]
                    ]
                ],
                'original_error' => $response->json()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
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
                'origin_contact_name' => 'Kripik Tempe Lakstari',
                'origin_contact_phone' => '081234567890', // Bisa disesuaikan
                'origin_address' => 'Toko Kripik Tempe Lakstari',
                'origin_postal_code' => env('BITESHIP_ORIGIN_POSTAL_CODE', '12440'),
                'destination_contact_name' => $alamat->nama_penerima ?? $pelanggan->nama_pelanggan,
                'destination_contact_phone' => $alamat->no_hp_penerima ?? $pelanggan->no_hp,
                'destination_address' => $alamat->alamat_lengkap . ', Kec. ' . $alamat->kecamatan . ', Kota ' . $alamat->kota,
                'destination_postal_code' => $alamat->kode_pos,
                'courier_company' => strtolower($pengiriman->kurir),
                'courier_type' => strtolower($pengiriman->layanan_kurir),
                'delivery_type' => 'later',
                'delivery_date' => date('Y-m-d', strtotime('+1 day')), // Besok
                'delivery_time' => '09:00',
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

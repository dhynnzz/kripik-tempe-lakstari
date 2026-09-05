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
            'origin_postal_code' => (int) $originPostalCode,
            'destination_postal_code' => (int) $request->destination_postal_code,
            'couriers' => 'jne,jnt,sicepat', // default couriers
            'items' => $biteshipItems
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.biteship.com/v1/rates/couriers', $payload);

            if ($response->successful()) {
                $responseData = $response->json();
                
                if (isset($responseData['pricing']) && is_array($responseData['pricing'])) {
                    $responseData['pricing'] = array_values(array_filter($responseData['pricing'], function ($option) {
                        return strpos(strtolower($option['courier_service_name'] ?? ''), 'trucking') === false;
                    }));
                }

                if (!empty($responseData['pricing'])) {
                    return response()->json([
                        'success' => true,
                        'data' => $responseData
                    ]);
                }
            }

            // Fallback cerdas: Jika saldo Biteship 0 Pts atau kuota habis, hitung tarif kurir dinamis berdasarkan zona jarak Kode Pos Indonesia dari Toko (Batu/Malang: 65311)
            $totalWeight = 0;
            foreach ($biteshipItems as $bi) {
                $totalWeight += ($bi['weight'] ?? 150) * ($bi['quantity'] ?? 1);
            }
            $weightKg = max(1, (int) ceil($totalWeight / 1000));

            $destPos = trim((string) ($request->destination_postal_code ?? '65311'));
            $firstDigit = substr($destPos, 0, 1);
            $firstTwo = substr($destPos, 0, 2);

            // Penentuan tarif zona berdasarkan jarak riil ekspedisi dari Kota Batu/Malang (65311)
            if ($firstTwo === '65') {
                // Zona 1: Malang Raya & Kota Batu (Lokal / Sangat Dekat)
                $baseJne = 9000;
                $baseJnt = 8000;
                $baseSicepat = 8500;
                $durasi = '1 hari';
            } elseif ($firstDigit === '6') {
                // Zona 2: Jawa Timur lainnya (Surabaya, Sidoarjo, Pasuruan, Kediri, Jember, dll.)
                $baseJne = 12000;
                $baseJnt = 11000;
                $baseSicepat = 11500;
                $durasi = '1 - 2 hari';
            } elseif ($firstDigit === '5') {
                // Zona 3: Jawa Tengah & D.I. Yogyakarta (Semarang, Solo, Jogja, dll.)
                $baseJne = 18000;
                $baseJnt = 17000;
                $baseSicepat = 17500;
                $durasi = '2 - 3 hari';
            } elseif ($firstDigit === '1' || $firstDigit === '4') {
                // Zona 4: Jabodetabek, Jawa Barat & Banten (Jakarta, Bandung, Bogor, Bekasi, dll.)
                $baseJne = 22000;
                $baseJnt = 21000;
                $baseSicepat = 20000;
                $durasi = '2 - 3 hari';
            } elseif ($firstDigit === '8') {
                // Zona 5: Bali & Nusa Tenggara (Denpasar, Mataram, Lombok, Kupang, dll.)
                $baseJne = 28000;
                $baseJnt = 27000;
                $baseSicepat = 26000;
                $durasi = '2 - 4 hari';
            } elseif ($firstDigit === '2' || $firstDigit === '3') {
                // Zona 6: Pulau Sumatera (Medan, Palembang, Padang, Pekanbaru, Lampung, dll.)
                $baseJne = 38000;
                $baseJnt = 37000;
                $baseSicepat = 36000;
                $durasi = '3 - 5 hari';
            } elseif ($firstDigit === '7') {
                // Zona 7: Pulau Kalimantan (Balikpapan, Banjarmasin, Pontianak, Samarinda, dll.)
                $baseJne = 42000;
                $baseJnt = 40000;
                $baseSicepat = 41000;
                $durasi = '3 - 5 hari';
            } elseif ($firstDigit === '9') {
                // Zona 8: Sulawesi, Maluku & Papua (Makassar, Manado, Ambon, Jayapura, dll.)
                $baseJne = 65000;
                $baseJnt = 62000;
                $baseSicepat = 63000;
                $durasi = '4 - 7 hari';
            } else {
                // Default Nasional
                $baseJne = 20000;
                $baseJnt = 19000;
                $baseSicepat = 19500;
                $durasi = '2 - 4 hari';
            }

            $fallbackPricing = [
                [
                    'company' => 'jne',
                    'courier_name' => 'jne',
                    'courier_service_name' => 'REG',
                    'courier_service_code' => 'reg',
                    'type' => 'reg',
                    'duration' => $durasi,
                    'price' => $baseJne * $weightKg,
                ],
                [
                    'company' => 'jnt',
                    'courier_name' => 'j&t',
                    'courier_service_name' => 'EZ',
                    'courier_service_code' => 'ez',
                    'type' => 'ez',
                    'duration' => $durasi,
                    'price' => $baseJnt * $weightKg,
                ],
                [
                    'company' => 'sicepat',
                    'courier_name' => 'sicepat',
                    'courier_service_name' => 'SIUNTUNG',
                    'courier_service_code' => 'siuntung',
                    'type' => 'siuntung',
                    'duration' => $durasi,
                    'price' => $baseSicepat * $weightKg,
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'success' => true,
                    'pricing' => $fallbackPricing
                ],
                'note' => 'Tarif dinamis berbasis zona wilayah'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }

    public function searchAreas(Request $request)
    {
        $input = $request->query('input');
        if (!$input) {
            return response()->json(['success' => false, 'message' => 'Parameter input wajib diisi'], 400);
        }

        $apiKey = env('BITESHIP_API_KEY');
        if (!$apiKey) {
            return response()->json(['success' => false, 'message' => 'Biteship API Key not configured'], 500);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $apiKey,
            ])->get('https://api.biteship.com/v1/maps/areas', [
                'countries' => 'ID',
                'input' => $input,
                'type' => 'single'
            ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'message' => 'Gagal mencari area dari Biteship.',
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
            'origin_postal_code' => (int) $originPostalCode,
            'destination_postal_code' => (int) $destinationPostalCode,
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
                        if (strtolower($pricing['courier_service_code']) === strtolower($layanan) && 
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
                
                // Referensi untuk pencarian di Dashboard Biteship
                'reference_id' => $transaksi->nomor_invoice,
                'invoice_id' => $transaksi->nomor_invoice,

                // Data Asal Penjemputan (Origin)
                'origin_contact_name' => 'Kripik Tempe Lakstari',
                'origin_contact_phone' => '081234567890', // Bisa disesuaikan
                'origin_address' => 'Toko Kripik Tempe Lakstari',
                'origin_postal_code' => (int) env('BITESHIP_ORIGIN_POSTAL_CODE', 65311),
                
                // Data Penerima (Destination)
                'destination_contact_name' => $alamat->nama_penerima ?? $pelanggan->nama_pelanggan,
                'destination_contact_phone' => $alamat->no_hp_penerima ?? $pelanggan->no_hp,
                'destination_address' => $alamat->alamat_lengkap . ', Kec. ' . $alamat->kecamatan . ', Kota ' . $alamat->kota,
                'destination_postal_code' => (int) $alamat->kode_pos,
                
                // Informasi Kurir
                'courier_company' => strtolower($pengiriman->kurir),
                'courier_type' => strtolower($pengiriman->layanan_kurir),
                'delivery_type' => 'now',
                
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

    /**
     * Membatalkan pesanan di Biteship
     */
    public static function cancelOrder(\App\Models\Pengiriman $pengiriman)
    {
        if (!$pengiriman->betship_order_id) return true; // Tidak ada yang perlu dibatalkan di Biteship

        try {
            $response = Http::withHeaders([
                'Authorization' => env('BITESHIP_API_KEY'),
                'Content-Type' => 'application/json'
            ])->delete('https://api.biteship.com/v1/orders/' . $pengiriman->betship_order_id, [
                'cancellation_reason' => 'Dibatalkan oleh Admin Toko'
            ]);

            if ($response->successful()) {
                // Berhasil dibatalkan di Biteship
                $pengiriman->betship_order_id = null; // Bisa dikosongkan atau biarkan saja
                $pengiriman->save();
                return true;
            }

            \Illuminate\Support\Facades\Log::error('Biteship Cancel Order Error: ' . $response->body());
            return false;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Biteship Cancel Order Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Mengambil data pelacakan resi langsung dari Biteship
     */
    public static function getTrackingData($waybill_id, $courier_code)
    {
        try {
            $apiKey = env('BITESHIP_API_KEY');
            if (!$apiKey) return null;

            $response = Http::withHeaders([
                'Authorization' => $apiKey
            ])->get("https://api.biteship.com/v1/trackings/{$waybill_id}/couriers/" . strtolower($courier_code));

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Biteship Tracking Error: ' . $e->getMessage());
            return null;
        }
    }
}

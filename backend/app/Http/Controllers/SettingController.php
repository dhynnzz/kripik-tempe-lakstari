<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    /**
     * Default fallback settings for Kripik Tempe Lakstari
     */
    private function defaultSettings()
    {
        return [
            'name' => 'Kripik Tempe Lakstari',
            'tagline' => 'Renyah, Gurih & Asli Tradisional Malang',
            'description' => 'Produsen dan penjual kripik tempe aneka rasa berkualitas terbaik dengan bahan kedelai pilihan dari Malang, Jawa Timur.',
            'cityOrigin' => 'Kota Malang, Jawa Timur (65145)',
            'address' => 'Jl. Raya Kripik Tempe No. 88, Sanan, Kota Malang, Jawa Timur 65125',

            'whatsapp' => '628123456789',
            'email' => 'kontak@kripiktempelakstari.id',
            'operatingHours' => 'Senin - Sabtu: 08.00 - 17.00 WIB',
            'instagram' => 'kripiktempe.lakstari',
            'tiktok' => 'lakstari_official',
            'facebook' => 'Kripik Tempe Lakstari',

            'lowStockThreshold' => 10,
            'outOfStockAction' => 'badge',

            'couriers' => [
                'jne' => true,
                'jnt' => true,
                'sicepat' => true,
                'pos' => true,
            ],
            'freeShippingEnabled' => true,
            'freeShippingMinAmount' => 100000,
            'packingDays' => 1,

            'paymentMethods' => [
                'qris' => true,
                'bca' => true,
                'bni' => true,
                'bri' => true,
            ],
            'paymentExpiryHours' => 24,
            'midtransEnvironment' => 'sandbox',
        ];
    }

    /**
     * Get all store settings (Public / User & Admin)
     */
    public function index()
    {
        $saved = Setting::get('store_settings');
        if (!$saved) {
            $saved = $this->defaultSettings();
            Setting::set('store_settings', $saved);
        }

        return response()->json([
            'success' => true,
            'data' => $saved
        ]);
    }

    /**
     * Update store settings (Admin Protected Sanctum)
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:150',
            'tagline' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'cityOrigin' => 'nullable|string|max:200',
            'address' => 'nullable|string|max:500',
            'whatsapp' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:100',
            'operatingHours' => 'nullable|string|max:150',
            'instagram' => 'nullable|string|max:100',
            'tiktok' => 'nullable|string|max:100',
            'facebook' => 'nullable|string|max:100',
            'lowStockThreshold' => 'nullable|integer|min:0',
            'outOfStockAction' => 'nullable|in:hide,badge',
            'couriers' => 'nullable|array',
            'freeShippingEnabled' => 'nullable|boolean',
            'freeShippingMinAmount' => 'nullable|numeric|min:0',
            'packingDays' => 'nullable|integer|min:1|max:30',
            'paymentMethods' => 'nullable|array',
            'paymentExpiryHours' => 'nullable|integer|min:1|max:72',
            'midtransEnvironment' => 'nullable|in:sandbox,production',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi input gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        $existing = Setting::get('store_settings') ?: $this->defaultSettings();
        $merged = array_merge($existing, $request->all());

        Setting::set('store_settings', $merged);

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan toko berhasil diperbarui.',
            'data' => $merged
        ]);
    }
}

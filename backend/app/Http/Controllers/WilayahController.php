<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class WilayahController extends Controller
{
    // Mengambil data Kecamatan berdasarkan ID Kota/Kabupaten
    public function getDistricts($regencyId)
    {
        if (empty($regencyId)) {
            return response()->json([]);
        }

        $data = Cache::remember("wilayah_districts_{$regencyId}", 86400, function () use ($regencyId) {
            try {
                $response = Http::timeout(8)->get("https://emsifa.github.io/api-wilayah-indonesia/api/districts/{$regencyId}.json");
                if ($response->successful()) {
                    return $response->json();
                }
            } catch (\Exception $e) {
                // Error handling fallback
            }
            return [];
        });

        return response()->json($data);
    }

    // Mengambil data Desa / Kelurahan berdasarkan ID Kecamatan
    public function getVillages($districtId)
    {
        if (empty($districtId)) {
            return response()->json([]);
        }

        $data = Cache::remember("wilayah_villages_{$districtId}", 86400, function () use ($districtId) {
            try {
                $response = Http::timeout(8)->get("https://emsifa.github.io/api-wilayah-indonesia/api/villages/{$districtId}.json");
                if ($response->successful()) {
                    return $response->json();
                }
            } catch (\Exception $e) {
                // Error handling fallback
            }
            return [];
        });

        return response()->json($data);
    }
}

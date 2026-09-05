<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ubah kolom status_pengiriman menjadi VARCHAR(50) agar fleksibel mendukung semua alur status
        try {
            DB::statement("ALTER TABLE pengiriman MODIFY COLUMN status_pengiriman VARCHAR(50) DEFAULT 'belum_diproses'");
        } catch (\Throwable $e) {
            // Fallback jika database driver lain
            Schema::table('pengiriman', function (Blueprint $table) {
                $table->string('status_pengiriman', 50)->default('belum_diproses')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            DB::statement("ALTER TABLE pengiriman MODIFY COLUMN status_pengiriman ENUM('belum_diproses', 'menunggu_pickup', 'dipickup', 'dalam_perjalanan', 'sampai_di_kota_tujuan', 'diantar_kurir', 'terkirim', 'gagal_dikirim', 'dikembalikan') DEFAULT 'belum_diproses'");
        } catch (\Throwable $e) {
            //
        }
    }
};

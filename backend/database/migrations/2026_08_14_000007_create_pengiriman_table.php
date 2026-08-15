<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengiriman', function (Blueprint $table) {
            $table->id('id_pengiriman');
            $table->unsignedBigInteger('id_transaksi');
            $table->unsignedBigInteger('id_pelanggan');
            $table->unsignedBigInteger('id_alamat');
            $table->string('betship_order_id', 100)->nullable();
            $table->string('kurir', 50);
            $table->string('layanan_kurir', 50);
            $table->string('nomor_resi', 100)->nullable();
            $table->integer('berat_total'); // gram
            $table->decimal('biaya_pengiriman', 12, 2);
            $table->enum('status_pengiriman', ['belum_diproses', 'menunggu_pickup', 'dipickup', 'dalam_perjalanan', 'sampai_di_kota_tujuan', 'diantar_kurir', 'terkirim', 'gagal_dikirim', 'dikembalikan'])->default('belum_diproses');
            $table->string('tracking_status', 100)->nullable();
            $table->dateTime('tanggal_dikirim')->nullable();
            $table->dateTime('tanggal_selesai')->nullable();
            $table->timestamps();

            $table->foreign('id_transaksi')->references('id_transaksi')->on('transaksi')->onDelete('cascade');
            $table->foreign('id_pelanggan')->references('id_pelanggan')->on('pelanggan')->onDelete('cascade');
            $table->foreign('id_alamat')->references('id_alamat')->on('alamat_pelanggan')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengiriman');
    }
};

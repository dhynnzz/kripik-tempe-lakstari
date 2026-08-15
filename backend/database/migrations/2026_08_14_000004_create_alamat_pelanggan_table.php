<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alamat_pelanggan', function (Blueprint $table) {
            $table->id('id_alamat');
            $table->unsignedBigInteger('id_pelanggan');
            $table->string('nama_penerima', 150);
            $table->string('no_hp_penerima', 20);
            $table->text('alamat_lengkap');
            $table->string('provinsi', 100);
            $table->string('kota', 100);
            $table->string('kecamatan', 100);
            $table->string('kelurahan', 100);
            $table->string('kode_pos', 10);
            $table->text('catatan')->nullable();
            $table->enum('status_alamat', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();

            $table->foreign('id_pelanggan')->references('id_pelanggan')->on('pelanggan')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alamat_pelanggan');
    }
};

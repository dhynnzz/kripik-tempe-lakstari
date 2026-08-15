<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detail_transaksi', function (Blueprint $table) {
            $table->id('id_detail');
            $table->unsignedBigInteger('id_transaksi');
            $table->unsignedBigInteger('id_product');
            $table->string('nama_product', 150);
            $table->decimal('harga_product', 12, 2);
            $table->integer('jumlah');
            $table->integer('berat_product'); // gram
            $table->decimal('subtotal', 12, 2);
            $table->enum('status_item', ['dipesan', 'diproses', 'dikemas', 'dikirim', 'selesai', 'dibatalkan'])->default('dipesan');
            $table->timestamps();

            $table->foreign('id_transaksi')->references('id_transaksi')->on('transaksi')->onDelete('cascade');
            $table->foreign('id_product')->references('id_product')->on('products')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_transaksi');
    }
};

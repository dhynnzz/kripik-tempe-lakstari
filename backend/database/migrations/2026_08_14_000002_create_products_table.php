<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id('id_product');
            $table->unsignedBigInteger('id_category');
            $table->string('nama_product', 150);
            $table->text('deskripsi_product');
            $table->decimal('harga_product', 12, 2);
            $table->integer('stok_product');
            $table->integer('berat_product'); // gram
            $table->string('foto_product', 255);
            $table->enum('status_product', ['aktif', 'nonaktif', 'habis'])->default('aktif');
            $table->timestamps();

            $table->foreign('id_category')->references('id_category')->on('categories')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};

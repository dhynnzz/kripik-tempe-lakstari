<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id('id_transaksi');
            $table->unsignedBigInteger('id_pelanggan');
            $table->unsignedBigInteger('id_alamat');
            $table->string('nomor_invoice', 50)->unique();
            $table->dateTime('tanggal_transaksi');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('biaya_pengiriman', 12, 2);
            $table->decimal('diskon', 12, 2);
            $table->decimal('total_pembayaran', 12, 2);
            $table->string('metode_pembayaran', 50);
            $table->enum('status_pembayaran', ['pending', 'paid', 'failed', 'expired', 'cancelled', 'refunded'])->default('pending');
            $table->enum('status_transaksi', ['menunggu_pembayaran', 'diproses', 'dikemas', 'siap_dikirim', 'dikirim', 'selesai', 'dibatalkan'])->default('menunggu_pembayaran');
            
            // Midtrans Integration
            $table->string('midtrans_order_id', 100)->nullable();
            $table->string('midtrans_transaction_id', 100)->nullable();
            $table->string('midtrans_payment_type', 50)->nullable();
            $table->string('midtrans_transaction_status', 50)->nullable();
            $table->dateTime('paid_at')->nullable();
            $table->dateTime('expired_at')->nullable();
            
            $table->timestamps();

            $table->foreign('id_pelanggan')->references('id_pelanggan')->on('pelanggan')->onDelete('cascade');
            $table->foreign('id_alamat')->references('id_alamat')->on('alamat_pelanggan')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi');
    }
};

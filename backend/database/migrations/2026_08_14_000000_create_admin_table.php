<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin', function (Blueprint $table) {
            $table->id('id_admin');
            $table->string('nama_admin', 150);
            $table->string('username', 100)->unique();
            $table->string('email', 150)->unique();
            $table->string('password', 255);
            $table->string('foto_admin', 255)->nullable();
            $table->enum('status_admin', ['aktif', 'nonaktif'])->default('aktif');
            $table->dateTime('last_login')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin');
    }
};

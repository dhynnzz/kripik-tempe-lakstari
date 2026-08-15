<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Admin::create([
            'nama_admin' => 'Admin Utama Lakstari',
            'username' => 'adminlakstari',
            'email' => 'admin@lakstari.com',
            'password' => \Illuminate\Support\Facades\Hash::make('adminlakstari2026'),
            'status_admin' => 'aktif'
        ]);
    }
}

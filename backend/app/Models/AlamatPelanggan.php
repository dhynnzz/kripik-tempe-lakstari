<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AlamatPelanggan extends Model
{
    use HasFactory;

    protected $table = 'alamat_pelanggan';
    protected $primaryKey = 'id_alamat';

    protected $fillable = [
        'id_pelanggan',
        'nama_penerima',
        'no_hp_penerima',
        'alamat_lengkap',
        'provinsi',
        'kota',
        'kecamatan',
        'kelurahan',
        'kode_pos',
        'catatan',
        'status_alamat',
    ];

    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class, 'id_pelanggan', 'id_pelanggan');
    }
}

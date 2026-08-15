<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengiriman extends Model
{
    use HasFactory;

    protected $table = 'pengiriman';
    protected $primaryKey = 'id_pengiriman';

    protected $fillable = [
        'id_transaksi',
        'id_pelanggan',
        'id_alamat',
        'betship_order_id',
        'kurir',
        'layanan_kurir',
        'nomor_resi',
        'berat_total',
        'biaya_pengiriman',
        'status_pengiriman',
        'tracking_status',
        'tanggal_dikirim',
        'tanggal_selesai',
    ];

    protected $casts = [
        'tanggal_dikirim' => 'datetime',
        'tanggal_selesai' => 'datetime',
    ];

    public function transaksi()
    {
        return $this->belongsTo(Transaksi::class, 'id_transaksi', 'id_transaksi');
    }

    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class, 'id_pelanggan', 'id_pelanggan');
    }

    public function alamat()
    {
        return $this->belongsTo(AlamatPelanggan::class, 'id_alamat', 'id_alamat');
    }
}

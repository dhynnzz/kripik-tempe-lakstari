<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    use HasFactory;

    protected $table = 'transaksi';
    protected $primaryKey = 'id_transaksi';

    protected $fillable = [
        'id_pelanggan',
        'id_alamat',
        'nomor_invoice',
        'tanggal_transaksi',
        'subtotal',
        'biaya_pengiriman',
        'diskon',
        'total_pembayaran',
        'metode_pembayaran',
        'status_pembayaran',
        'status_transaksi',
        'midtrans_order_id',
        'midtrans_transaction_id',
        'midtrans_payment_type',
        'midtrans_transaction_status',
        'paid_at',
        'expired_at',
    ];

    protected $casts = [
        'tanggal_transaksi' => 'datetime',
        'paid_at' => 'datetime',
        'expired_at' => 'datetime',
    ];

    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class, 'id_pelanggan', 'id_pelanggan');
    }

    public function alamat()
    {
        return $this->belongsTo(AlamatPelanggan::class, 'id_alamat', 'id_alamat');
    }

    public function details()
    {
        return $this->hasMany(DetailTransaksi::class, 'id_transaksi', 'id_transaksi');
    }

    public function pengiriman()
    {
        return $this->hasOne(Pengiriman::class, 'id_transaksi', 'id_transaksi');
    }
}

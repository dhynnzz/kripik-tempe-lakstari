<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';
    protected $primaryKey = 'id_product';

    protected $fillable = [
        'id_category',
        'nama_product',
        'varian_rasa',
        'deskripsi_product',
        'harga_product',
        'stok_product',
        'stok_minimum',
        'berat_product',
        'foto_product',
        'status_product',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'id_category', 'id_category');
    }
}

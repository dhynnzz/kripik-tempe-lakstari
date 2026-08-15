<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('category')->get();
        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_category' => 'required|exists:categories,id_category',
            'nama_product' => 'required|string|max:150',
            'deskripsi_product' => 'required|string',
            'harga_product' => 'required|numeric',
            'stok_product' => 'required|integer',
            'berat_product' => 'required|integer',
            'foto_product' => 'required|string',
            'status_product' => 'in:aktif,nonaktif,habis'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $product = Product::create($request->all());

        return response()->json(['success' => true, 'message' => 'Produk berhasil ditambahkan', 'data' => $product]);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Produk tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_category' => 'sometimes|required|exists:categories,id_category',
            'nama_product' => 'sometimes|required|string|max:150',
            'deskripsi_product' => 'sometimes|required|string',
            'harga_product' => 'sometimes|required|numeric',
            'stok_product' => 'sometimes|required|integer',
            'berat_product' => 'sometimes|required|integer',
            'foto_product' => 'sometimes|required|string',
            'status_product' => 'sometimes|in:aktif,nonaktif,habis'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $product->update($request->all());

        return response()->json(['success' => true, 'message' => 'Produk berhasil diupdate', 'data' => $product]);
    }

    public function destroy($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Produk tidak ditemukan'], 404);
        }

        $product->delete();

        return response()->json(['success' => true, 'message' => 'Produk berhasil dihapus']);
    }

    public function updateStock(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Produk tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'stok_product' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $product->stok_product = $request->stok_product;
        if ($product->stok_product == 0) {
            $product->status_product = 'habis';
        } elseif ($product->status_product == 'habis' && $product->stok_product > 0) {
            $product->status_product = 'aktif';
        }
        $product->save();

        return response()->json(['success' => true, 'message' => 'Stok produk berhasil diupdate', 'data' => $product]);
    }
}

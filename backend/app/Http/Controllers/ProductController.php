<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('category')->paginate(10);
        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_category' => 'required|exists:categories,id_category',
            'nama_product' => 'required|string|max:150',
            'varian_rasa' => 'nullable|string|max:100',
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

        $data = $request->all();
        if (isset($data['foto_product'])) {
            $data['foto_product'] = $this->processBase64Image($data['foto_product']);
        }

        $product = Product::create($data);

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
            'varian_rasa' => 'nullable|string|max:100',
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

        $data = $request->all();
        if (isset($data['stok_product'])) {
            $stock = (int)$data['stok_product'];
            if ($stock == 0) {
                $data['status_product'] = 'habis';
            } elseif ($product->status_product == 'habis' && $stock > 0) {
                $data['status_product'] = 'aktif';
            }
        }

        if (isset($data['foto_product'])) {
            $data['foto_product'] = $this->processBase64Image($data['foto_product']);
        }

        $product->update($data);

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

    private function processBase64Image($base64String)
    {
        if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $type)) {
            $data = substr($base64String, strpos($base64String, ',') + 1);
            $type = strtolower($type[1]);
            
            if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                return $base64String;
            }
            
            $data = base64_decode($data);
            if ($data === false) return $base64String;

            $fileName = uniqid() . '.' . $type;
            \Illuminate\Support\Facades\Storage::disk('public')->put('products/' . $fileName, $data);
            
            return '/storage/products/' . $fileName;
        }
        return $base64String;
    }
}

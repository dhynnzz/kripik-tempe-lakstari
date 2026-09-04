<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        if ($request->has('category_id')) {
            $query->where('id_category', $request->category_id);
        }

        if ($request->has('status')) {
            $query->where('status_product', $request->status);
        }

        // Jika klien secara eksplisit meminta paginasi dengan batas per_page
        if ($request->has('per_page')) {
            $perPage = (int) $request->input('per_page', 10);
            return response()->json($query->orderBy('id_product', 'desc')->paginate($perPage));
        }

        // Default: kembalikan seluruh katalog produk terbaru di urutan teratas
        $products = $query->orderBy('id_product', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $products,
            'total' => $products->count()
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_category' => 'nullable',
            'nama_product' => 'required|string|max:150',
            'varian_rasa' => 'nullable|string|max:100',
            'deskripsi_product' => 'nullable|string',
            'harga_product' => 'required|numeric',
            'stok_product' => 'required|integer',
            'berat_product' => 'nullable|integer',
            'foto_product' => 'nullable|string',
            'status_product' => 'nullable|in:aktif,nonaktif,habis'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->all();

        // Validasi & fallback kategori jika kosong atau tidak valid di database
        if (empty($data['id_category']) || !\App\Models\Category::where('id_category', $data['id_category'])->exists()) {
            $fallbackCat = \App\Models\Category::first();
            $data['id_category'] = $fallbackCat ? $fallbackCat->id_category : 1;
        }

        if (empty($data['deskripsi_product'])) {
            $data['deskripsi_product'] = 'Produk olahan Kripik tempe Lakstari lezat & renyah.';
        }
        if (empty($data['berat_product'])) {
            $data['berat_product'] = 100;
        }
        if (empty($data['foto_product'])) {
            $data['foto_product'] = '/images/products/flavor-original.png';
        }
        if (empty($data['status_product'])) {
            $data['status_product'] = ((int)($data['stok_product'] ?? 0)) == 0 ? 'habis' : 'aktif';
        }

        if (isset($data['foto_product'])) {
            $data['foto_product'] = $this->processBase64Image($data['foto_product']);
        }

        $product = Product::create($data);
        $product->load('category');

        return response()->json(['success' => true, 'message' => 'Produk berhasil ditambahkan', 'data' => $product], 201);
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

        try {
            $product->delete();
            return response()->json(['success' => true, 'message' => 'Produk berhasil dihapus']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Gagal menghapus produk: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Gagal menghapus produk dari database.'], 500);
        }
    }

    public function updateStock(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Produk tidak ditemukan'], 404);
        }

        $inputStock = $request->input('stok_product', $request->input('stock'));
        if ($inputStock === null || !is_numeric($inputStock)) {
            return response()->json(['success' => false, 'message' => 'Stok produk harus berupa angka valid.'], 422);
        }

        $product->stok_product = max(0, (int)$inputStock);
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

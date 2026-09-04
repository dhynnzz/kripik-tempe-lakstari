<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('products')->get();
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_category' => 'required|string|max:100',
            'status_category' => 'in:aktif,nonaktif'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $category = Category::create([
            'nama_category' => $request->nama_category,
            'status_category' => $request->status_category ?? 'aktif'
        ]);
        $category->products_count = 0;

        return response()->json(['success' => true, 'message' => 'Kategori berhasil ditambahkan', 'data' => $category], 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Kategori tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama_category' => 'sometimes|required|string|max:100',
            'status_category' => 'sometimes|in:aktif,nonaktif'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $category->update($request->all());

        return response()->json(['success' => true, 'message' => 'Kategori berhasil diupdate', 'data' => $category]);
    }

    public function destroy($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Kategori tidak ditemukan'], 404);
        }

        $productCount = $category->products()->count();
        if ($productCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Kategori \"{$category->nama_category}\" tidak dapat dihapus karena masih digunakan oleh {$productCount} produk aktif. Silakan ubah kategori produk terkait terlebih dahulu."
            ], 422);
        }

        try {
            $category->delete();
            return response()->json(['success' => true, 'message' => 'Kategori berhasil dihapus']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Gagal menghapus kategori: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Gagal menghapus kategori dari database.'], 500);
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminAccountController extends Controller
{
    // [ADMIN] Ambil Semua Akun Admin
    public function index()
    {
        $admins = Admin::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $admins]);
    }

    // [ADMIN] Tambah Admin Baru
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_admin' => 'required|string|max:100',
            'username' => 'required|string|unique:admin,username',
            'email' => 'required|email|unique:admin,email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $admin = Admin::create([
            'nama_admin' => $request->nama_admin,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password), // SECURE: Hashed Password
            'status_admin' => 'aktif',
        ]);

        return response()->json(['success' => true, 'message' => 'Admin berhasil ditambahkan', 'data' => $admin]);
    }

    // [ADMIN] Ubah Status Admin (Aktif / Nonaktif)
    public function updateStatus(Request $request, $id)
    {
        // Jangan biarkan admin mematikan akunnya sendiri jika dia admin utama
        $admin = Admin::findOrFail($id);
        
        if ($request->has('status_admin')) {
            $admin->status_admin = $request->status_admin;
        }

        $admin->save();

        return response()->json(['success' => true, 'message' => 'Status Admin diperbarui', 'data' => $admin]);
    }
}

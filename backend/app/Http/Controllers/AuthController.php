<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $admin = Admin::where('email', $request->email)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau Password Admin salah!'
            ], 401);
        }

        if ($admin->status_admin !== 'aktif') {
            return response()->json([
                'success' => false,
                'message' => 'Akun Admin ini telah dinonaktifkan.'
            ], 403);
        }

        // Update last login
        $admin->last_login = now();
        $admin->save();

        \Illuminate\Support\Facades\Auth::guard('admin')->login($admin);
        $token = $admin->createToken('admin_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login Admin Berhasil!',
            'token' => $token,
            'user' => [
                'id' => $admin->id_admin,
                'name' => $admin->nama_admin,
                'email' => $admin->email,
            ]
        ]);
    }

    public function me(Request $request)
    {
        $admin = $request->user();
        return response()->json([
            'success' => true,
            'user' => $admin,
        ]);
    }

    public function logout(Request $request)
    {
        if ($request->user() && method_exists($request->user(), 'currentAccessToken') && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }
        \Illuminate\Support\Facades\Auth::guard('admin')->logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.'
        ]);
    }
}

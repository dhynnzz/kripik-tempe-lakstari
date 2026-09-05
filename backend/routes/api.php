<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Routes
Route::post('/admin/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::get('/products', [ProductController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/checkout', [\App\Http\Controllers\OrderController::class, 'checkout']);
Route::post('/payment/notification', [\App\Http\Controllers\OrderController::class, 'paymentNotification']);
Route::post('/payment/success-fallback', [\App\Http\Controllers\OrderController::class, 'paymentSuccessFallback']);
Route::post('/track-order', [\App\Http\Controllers\OrderController::class, 'trackOrder']);
Route::get('/wilayah/districts/{regencyId}', [\App\Http\Controllers\WilayahController::class, 'getDistricts']);
Route::get('/wilayah/villages/{districtId}', [\App\Http\Controllers\WilayahController::class, 'getVillages']);
Route::post('/shipping-rates', [\App\Http\Controllers\BiteshipController::class, 'getRates']);
Route::get('/biteship/areas', [\App\Http\Controllers\BiteshipController::class, 'searchAreas']);

// Protected Routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/me', [AuthController::class, 'me']);
    Route::post('/admin/logout', [AuthController::class, 'logout']);

    // Admin Category Management
    Route::get('/admin/categories', [CategoryController::class, 'index']);
    Route::post('/admin/categories', [CategoryController::class, 'store']);
    Route::put('/admin/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/admin/categories/{id}', [CategoryController::class, 'destroy']);

    // Admin Product Management
    Route::get('/admin/products', [ProductController::class, 'index']);
    Route::post('/admin/products', [ProductController::class, 'store']);
    Route::put('/admin/products/{id}', [ProductController::class, 'update']);
    Route::put('/admin/products/{id}/stock', [ProductController::class, 'updateStock']);
    Route::delete('/admin/products/{id}', [ProductController::class, 'destroy']);
    // Admin Orders Management
    Route::get('/admin/orders', [\App\Http\Controllers\OrderController::class, 'index']);
    Route::put('/admin/orders/{id}', [\App\Http\Controllers\OrderController::class, 'updateStatus']);

    // Admin Customers Management
    Route::get('/admin/customers', [\App\Http\Controllers\CustomerController::class, 'index']);
    Route::put('/admin/customers/{id}', [\App\Http\Controllers\CustomerController::class, 'updateStatus']);

    // Admin Shipments Management
    Route::get('/admin/shipments', [\App\Http\Controllers\ShipmentController::class, 'index']);
    Route::put('/admin/shipments/{id}', [\App\Http\Controllers\ShipmentController::class, 'update']);

    // Admin Reports Dashboard
    Route::get('/admin/reports/dashboard', [\App\Http\Controllers\ReportController::class, 'dashboardStats']);
    Route::get('/admin/reports/analytics', [\App\Http\Controllers\ReportController::class, 'analyticsReport']);
    Route::get('/admin/reports/sales-chart', [\App\Http\Controllers\ReportController::class, 'salesChart']);

    // Admin Accounts Management
    Route::get('/admin/accounts', [\App\Http\Controllers\AdminAccountController::class, 'index']);
    Route::post('/admin/accounts', [\App\Http\Controllers\AdminAccountController::class, 'store']);
    Route::put('/admin/accounts/{id}', [\App\Http\Controllers\AdminAccountController::class, 'updateStatus']);

    // User route for sanctum
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

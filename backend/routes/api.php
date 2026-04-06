<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\CategoryController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public Routes - No Authentication Required
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Product Routes (Public - No Auth)
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/{id}', [ProductController::class, 'show']);
    Route::get('/filters/categories', [ProductController::class, 'categories']);
    Route::get('/filters/locations', [ProductController::class, 'locations']);
    Route::get('/filters/brands', [ProductController::class, 'brands']);
});

// Protected Routes - Require Authentication
Route::middleware('auth:sanctum')->group(function () {
    // Auth Routes
    Route::prefix('auth')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // Order Routes (User specific)
    Route::prefix('orders')->group(function () {
        Route::post('/checkout', [OrderController::class, 'checkout']);
        Route::get('/', [OrderController::class, 'userOrders']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::post('/{id}/payment-proof', [OrderController::class, 'uploadPaymentProof']);
        Route::post('/{id}/cancel', [OrderController::class, 'cancel']);
    });

    // Admin Routes - Require Admin Role
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Dashboard
        Route::prefix('dashboard')->group(function () {
            Route::get('/stats', [DashboardController::class, 'getStats']);
            Route::get('/sales-chart', [DashboardController::class, 'getSalesChart']);
        });

        // Products Management
        Route::prefix('products')->group(function () {
            Route::get('/', [AdminProductController::class, 'index']);
            Route::post('/', [AdminProductController::class, 'store']);
            Route::get('/{id}', [AdminProductController::class, 'show']);
            Route::put('/{id}', [AdminProductController::class, 'update']);
            Route::delete('/{id}', [AdminProductController::class, 'destroy']);
            Route::post('/update-stock', [AdminProductController::class, 'updateStock']);
        });

        // Categories Management
        Route::prefix('categories')->group(function () {
            Route::get('/', [CategoryController::class, 'index']);
            Route::post('/', [CategoryController::class, 'store']);
            Route::put('/{id}', [CategoryController::class, 'update']);
            Route::delete('/{id}', [CategoryController::class, 'destroy']);
        });

        // Orders Management
        Route::prefix('orders')->group(function () {
            Route::get('/', [AdminOrderController::class, 'index']);
            Route::get('/{id}', [AdminOrderController::class, 'show']);
            Route::post('/{id}/verify-payment', [AdminOrderController::class, 'verifyPayment']);
            Route::post('/{id}/reject-payment', [AdminOrderController::class, 'rejectPayment']);
            Route::put('/{id}/status', [AdminOrderController::class, 'updateStatus']);
            Route::post('/{id}/cancel', [AdminOrderController::class, 'cancel']);
        });
    });
});

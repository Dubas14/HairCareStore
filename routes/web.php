<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\DashboardController;

// Публічні маршрути
Route::get('/', [ProductController::class, 'index'])->name('products.index');
Route::get('/categories/{category:slug}', [ProductController::class, 'index'])->name('products.by_category');
Route::get('/product/{product}', [ProductController::class, 'show'])->name('products.show');

// Кошик
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/add/{product}', [CartController::class, 'add'])->name('cart.add');
Route::post('/cart/remove/{productId}', [CartController::class, 'remove'])->name('cart.remove');

// Автентифікація
Auth::routes();
Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

// Для залогінених користувачів
Route::post('/checkout', [OrderController::class, 'store'])->name('checkout.store')->middleware('auth');

// Адмін-панель
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('orders', AdminOrderController::class)->only(['index', 'show']);
    Route::post('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.updateStatus');
    Route::resource('categories', AdminCategoryController::class);
    Route::resource('products', AdminProductController::class);
});

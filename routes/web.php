<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CashierController;
use App\Http\Controllers\TransactionController;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('auth/login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Cashier
    Route::resource('cashier', CashierController::class);

    // Produk
    Route::get('/products/search', [ProductController::class, 'search'])->name('products.search');
    Route::resource('products', ProductController::class);

    // Transaksi
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');

    Route::post('/products/import-csv', [ProductController::class, 'importCsv'])->name('products.import.csv');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

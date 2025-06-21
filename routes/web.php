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
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// routes/web.php
Route::middleware(['auth', 'verified'])->group(function () {
    //Route::get('/cashier', [CashierController::class, 'index'])->name('cashier.index');
    Route::resource('cashier', CashierController::class);
    Route::get('/products/search', [ProductController::class, 'search'])->name('products.search');
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
});

// routes/web.php
Route::get('/products/search', [ProductController::class, 'search'])->name('products.search');    


Route::resource('products', ProductController::class);

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

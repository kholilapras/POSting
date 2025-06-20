<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierController extends Controller
{
    public function index()
    {
        // Misal: kita ingin menampilkan 5 produk terakhir ditambahkan ke database
        $recentProducts = \App\Models\Product::latest()->take(5)->get();

        return Inertia::render('cashier/index', [
            'recentProducts' => $recentProducts,
        ]);
    }
}

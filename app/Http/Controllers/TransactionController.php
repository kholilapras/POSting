<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        // Validasi input dari form kasir (frontend)
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'paid' => 'required|numeric|min:0',
        ]);

        // Jalankan semua proses di dalam database transaction
        DB::transaction(function () use ($validated) {
            $items = $validated['items'];
            $paid = $validated['paid'];

            // Hitung total belanja
            $total = collect($items)->sum(function ($item) {
                $product = Product::findOrFail($item['id']);
                return $product->product_price * $item['qty'];
            });

            // Simpan transaksi utama
            $transaction = Transaction::create([
                'user_id' => Auth::id(),
                'total'   => $total,
                'paid'    => $paid,
            ]);

            // Simpan detail transaksi + update stok
            foreach ($items as $item) {
                $product = Product::findOrFail($item['id']);

                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id'     => $product->id,
                    'price'          => $product->product_price,
                    'qty'            => $item['qty'],
                ]);

                $product->decrement('product_stock', $item['qty']);
            }
        });

        return redirect()->route('cashier')->with('success', 'Transaksi berhasil disimpan.');
    }
}

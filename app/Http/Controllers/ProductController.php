<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = Product::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('product_code', 'like', "%{$search}%")
                    ->orWhere('product_name', 'like', "%{$search}%");
            });
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        return inertia('products', [
            'products' => $products,
            'search' => $search,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_code' => 'required|string|max:50|unique:products',
            'product_name' => 'required|string|max:200',
            'product_price' => 'required|integer',
            'product_stock' => 'required|integer',
        ]);

        Product::create($validated);
        return back()->with('success', 'Product created.');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'product_code' => 'required|string|max:50|unique:products,product_code,' . $product->id,
            'product_name' => 'required|string|max:200',
            'product_price' => 'required|integer',
            'product_stock' => 'required|integer',
        ]);

        $product->update($validated);
        return back()->with('success', 'Product updated.');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return back()->with('success', 'Product deleted.');
    }

    public function search(Request $request)
    {
        $products = Product::query()
            ->where('product_name', 'like', '%' . $request->q . '%')
            ->orWhere('product_code', 'like', '%' . $request->q . '%')
            ->get();

        return inertia()->render('cashier', [
            'products' => $products,
        ]);
    }


    public function importCsv(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file')->getRealPath();
        $handle = fopen($file, 'r');
        $header = fgetcsv($handle); // Baris header pertama

        if (!$header || count($header) < 4) {
            return back()->withErrors(['file' => 'Format CSV tidak sesuai. Minimal harus punya 4 kolom.']);
        }

        $imported = 0;
        $skipped = 0;
        $duplicates = [];

        while (($row = fgetcsv($handle)) !== false) {
            $code  = trim($row[0] ?? '');
            $name  = trim($row[1] ?? '');
            $price = (float)($row[2] ?? 0);
            $stock = (int)($row[3] ?? 0);

            if (!$code || !$name || $price < 0 || $stock < 0) {
                $skipped++;
                continue;
            }

            $exists = Product::where('product_code', $code)->first();

            if ($exists) {
                $skipped++;
                $duplicates[] = $code;
                continue;
            }

            Product::create([
                'product_code' => $code,
                'product_name' => $name,
                'product_price' => $price,
                'product_stock' => $stock,
            ]);

            $imported++;
        }

        fclose($handle);

        $message = "{$imported} produk berhasil diimpor.";
        if ($skipped > 0) {
            $message .= " {$skipped} dilewati (duplikat / data tidak valid).";
        }

        if (!empty($duplicates)) {
            $message .= " Duplikat: " . implode(', ', $duplicates);
        }

        return redirect()->route('products.index')->with('success', $message);
    }
}

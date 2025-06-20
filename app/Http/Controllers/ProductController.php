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
}

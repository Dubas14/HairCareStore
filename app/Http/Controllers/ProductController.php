<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Category $category = null)
    {
        $productsQuery = Product::query();

        if ($category) {
            $productsQuery->where('category_id', $category->id);
        }

        $products = $productsQuery->with('category')->latest()->paginate(9);
        $categories = Category::all();

        return view('products.index', compact('products', 'categories', 'category'));
    }

    public function show(Product $product)
    {
        // Потрібно створити цей view, якщо його немає
        return view('products.show', compact('product'));
    }
}

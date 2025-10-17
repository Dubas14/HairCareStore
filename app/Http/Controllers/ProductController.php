<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category; // <-- Важливо: імпортуємо модель Category
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Category $category = null)
    {
        $productsQuery = Product::query();

        if ($category) {
            $productsQuery->where('category_id', $category->id);
        }

        // Використовуємо with('category') для жадібного завантаження та paginate() для пагінації
        $products = $productsQuery->with('category')->latest()->paginate(9);
        $categories = Category::all();

        return view('products.index', compact('products', 'categories', 'category'));
    }

    public function show(Product $product)
    {
        return view('products.show', compact('product'));
    }
}

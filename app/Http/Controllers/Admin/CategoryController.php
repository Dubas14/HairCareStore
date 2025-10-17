<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::latest()->paginate(10);
        return view('admin.categories.index', compact('categories'));
    }

    public function create()
    {
        return view('admin.categories.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories',
        ]);
        Category::create($validated);
        return redirect()->route('admin.categories.index')->with('success', 'Категорію успішно створено.');
    }

    // Цей метод потрібен для маршруту resource
    public function show(Category $category)
    {
        return redirect()->route('admin.categories.edit', $category);
    }

    public function edit(Category $category)
    {
        return view('admin.categories.edit', compact('category'));
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', Rule::unique('categories')->ignore($category->id)],
        ]);
        $category->update($validated);
        return redirect()->route('admin.categories.index')->with('success', 'Категорію успішно оновлено.');
    }

    // Цей метод потрібен для маршруту resource
    public function destroy(Category $category)
    {
        if ($category->products()->count() > 0) {
            return back()->with('error', 'Неможливо видалити категорію, оскільки в ній є товари.');
        }
        $category->delete();
        return redirect()->route('admin.categories.index')->with('success', 'Категорію успішно видалено.');
    }
}

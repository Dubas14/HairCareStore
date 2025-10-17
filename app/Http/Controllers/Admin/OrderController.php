<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        // Беремо всі замовлення, новіші зверху, з інформацією про користувача
        $orders = Order::with('user')->latest()->paginate(15);
        return view('admin.orders.index', compact('orders'));
    }

    public function show(Order $order)
    {
        // Завантажуємо товари, що належать до цього замовлення
        $order->load('products');
        return view('admin.orders.show', compact('order'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate(['status' => 'required|string']);
        $order->update(['status' => $request->status]);

        return redirect()->route('admin.orders.show', $order)->with('success', 'Статус замовлення оновлено!');
    }

    public function update(Request $request, Category $category)
    {
        // Валідуємо дані. Правило 'unique' має ігнорувати поточну категорію
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories')->ignore($category->id),
            ],
        ]);

        // Оновлюємо дані категорії
        $category->update($validated);

        return redirect()->route('admin.categories.index')->with('success', 'Категорію успішно оновлено.');
    }
}

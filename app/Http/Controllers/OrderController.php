<?php

namespace App\Http\Controllers; // <-- Перевірте цей рядок

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        // 1. Валідація даних з форми
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
        ]);

        $cart = session()->get('cart', []);

        // Перевірка, чи не порожній кошик
        if (empty($cart)) {
            return redirect()->route('products.index');
        }

        // 2. Розрахунок загальної суми
        $totalPrice = 0;
        foreach ($cart as $details) {
            $totalPrice += $details['price'] * $details['quantity'];
        }

        // 3. Створення замовлення в таблиці `orders`
        $order = Order::create([
            'user_id' => Auth::id(),
            'customer_name' => $request->name,
            'customer_phone' => $request->phone,
            'customer_address' => $request->address,
            'total_price' => $totalPrice,
            'status' => 'В обробці', // Початковий статус
        ]);

        // 4. Прив'язка товарів з кошика до замовлення
        foreach ($cart as $id => $details) {
            $order->products()->attach($id, [
                'quantity' => $details['quantity'],
                'price' => $details['price'] // Зберігаємо ціну на момент покупки
            ]);
        }

        // 5. Очищення кошика
        session()->forget('cart');

        // 6. Перенаправлення з повідомленням про успіх
        return redirect()->route('products.index')->with('success', 'Дякуємо! Ваше замовлення успішно оформлено.');
    }
}

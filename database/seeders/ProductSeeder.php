<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::create([
            'category_id' => 1,
            'name' => 'Шампунь "Шовкове Сяйво" для сухого волосся',
            'description' => 'Інтенсивно зволожуючий шампунь з аргановою олією та протеїнами шовку.',
            'price' => 350.00,
            'image' => null
        ]);

        Product::create([
            'category_id' => 2,
            'name' => 'Відновлююча маска "Кератинова Сила"',
            'description' => 'Глибоко відновлює пошкоджену структуру волосся, наповнюючи його кератином.',
            'price' => 520.50,
            'image' => null
        ]);
    }
}

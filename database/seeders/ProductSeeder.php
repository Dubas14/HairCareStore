<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product; // Додаємо імпорт моделі

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::create([
            'name' => 'Ноутбук "BladeMaster Pro"',
            'description' => 'Потужний ноутбук для розробки та ігор.',
            'price' => 45999.99,
            'image' => 'https://via.placeholder.com/640x480.png/00ff77?text=Laptop'
        ]);

        Product::create([
            'name' => 'Механічна клавіатура "CodeType X"',
            'description' => 'Ідеальна клавіатура для програмістів.',
            'price' => 3200.00,
            'image' => 'https://via.placeholder.com/640x480.png/0022ff?text=Keyboard'
        ]);

        Product::create([
            'name' => 'Монітор "PixelPerfect 4K"',
            'description' => '27-дюймовий 4K монітор з чудовою передачею кольору.',
            'price' => 15500.50,
            'image' => 'https://via.placeholder.com/640x480.png/ff0000?text=Monitor'
        ]);
    }
}

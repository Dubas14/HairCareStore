<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::create(['name' => 'Шампуні', 'slug' => 'shampoos']);
        Category::create(['name' => 'Маски та Бальзами', 'slug' => 'masks-and-balms']);
        Category::create(['name' => 'Олійки та Сироватки', 'slug' => 'oils-and-serums']);
        Category::create(['name' => 'Аксесуари', 'slug' => 'accessories']);
    }
}

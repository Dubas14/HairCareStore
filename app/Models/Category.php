<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    /**
     * Атрибути, які можна масово заповнювати.
     */
    protected $fillable = [
        'name',
        'slug',
    ];

    /**
     * Отримати товари для цієї категорії.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    /**
     * Атрибути, які можна масово заповнювати.
     */
    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
        'category_id',
    ];

    /**
     * Отримати категорію, до якої належить товар.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}

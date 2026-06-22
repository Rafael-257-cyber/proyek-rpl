<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'subtitle',
        'discount_percentage',
        'image_path',
        'button_text',
        'is_active',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_promo', 'promo_id', 'product_id');
    }
}

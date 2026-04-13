<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'order_item_id',
        'rating',
        'review',
    ];

    protected $casts = [
        'rating' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get product
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get order item
     */
    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}

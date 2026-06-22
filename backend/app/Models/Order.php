<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        // English fields
        'user_id',
        'shipping_name',
        'total_price',
        'status',
        'payment_method',
        'payment_proof',
        'shipping_address',
        'shipping_city',
        'shipping_phone',
        'shipping_courier',
        'shipping_service',
        'shipping_estimate',
        'tracking_number',
        'shipped_at',
        'delivered_at',
        // Indonesian variants (some migrations use these names)
        'id_pelanggan',
        'total_harga',
        'ongkir',
        'metode_bayar',
        'bukti_bayar',
        'no_resi',
        'catatan',
        // New payment fields
        'payment_status',
        'payment_proof_uploaded_by',
        'payment_proof_uploaded_at',
        'payment_due_at',
        'snap_token',
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
        'ongkir' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'payment_proof_uploaded_at' => 'datetime',
        'payment_due_at' => 'datetime',
    ];

    /**
     * Get user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get order items
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}

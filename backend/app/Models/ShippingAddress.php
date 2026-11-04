<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingAddress extends Model
{
    protected $fillable = ['shipping_name', 'shipping_phone', 'shipping_address', 'shipping_city', 'destination', 'fingerprint'];

    protected $hidden = ['fingerprint', 'user_id'];

    protected $casts = ['destination' => 'array'];
}

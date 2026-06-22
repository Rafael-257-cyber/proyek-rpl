<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PromoController extends Controller
{
    public function index()
    {
        $promos = \App\Models\Promo::where('is_active', true)->get();
        return response()->json(['data' => $promos]);
    }
}

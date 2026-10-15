<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RajaOngkir;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ShippingController extends Controller
{
    public function destinations(Request $request, RajaOngkir $shipping)
    {
        $data = $request->validate(['search' => 'required|string|min:3|max:100']);
        return response()->json(['data' => $shipping->destinations(trim($data['search']))]);
    }

    public function couriers()
    {
        return response()->json(['data' => config('rajaongkir.couriers')]);
    }

    public function rates(Request $request, RajaOngkir $shipping)
    {
        $data = $request->validate([
            'destination_id' => 'required|integer|min:1',
            'courier' => ['required', 'string', Rule::in(config('rajaongkir.couriers'))],
            'items' => 'required|array|min:1|max:100',
            'items.*.product_id' => 'required|integer|distinct|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1|max:1000',
        ]);
        return response()->json($shipping->rates($data['destination_id'], $data['items'], $data['courier']));
    }
}

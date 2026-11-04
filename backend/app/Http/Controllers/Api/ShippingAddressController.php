<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ShippingAddressController extends Controller
{
    public function index(Request $request)
    {
        $saved = $request->user()->shippingAddresses()->latest('updated_at')->get();
        $fingerprints = $saved->pluck('fingerprint')->all();
        $recent = $request->user()->orders()->latest('id')->limit(30)->get()
            ->filter(fn ($order) => $order->shipping_name && $order->shipping_phone && $order->shipping_address)
            ->map(function ($order) {
                return [
                    'id' => 'order-'.$order->id,
                    'order_id' => $order->id,
                    'shipping_name' => $order->shipping_name,
                    'shipping_phone' => $order->shipping_phone,
                    'shipping_address' => $order->shipping_address,
                    'shipping_city' => $order->shipping_city,
                    'destination' => $order->shipping_destination_id ? [
                        'id' => (int) $order->shipping_destination_id,
                        'label' => $order->shipping_city,
                        'city_name' => $order->shipping_city,
                    ] : null,
                ];
            })->unique(fn ($address) => $this->fingerprint($address))
            ->reject(fn ($address) => in_array($this->fingerprint($address), $fingerprints, true))
            ->take(10)->values();
        return response()->json(['data' => $saved, 'recent' => $recent]);
    }

    private function fingerprint(array $data): string
    {
        $parts = array_map(fn ($value) => mb_strtolower(preg_replace('/\s+/u', ' ', trim((string) $value))), [
            $data['shipping_name'], $data['shipping_phone'], $data['shipping_address'],
            $data['shipping_city'], $data['destination']['id'] ?? '',
        ]);
        return hash('sha256', json_encode($parts));
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'shipping_name' => 'required|string|max:100',
            'shipping_phone' => 'required|string|min:7|max:30',
            'shipping_address' => 'required|string|max:1000',
            'destination' => 'required|array:id,label,city_name,province_name,district_name,subdistrict_name,zip_code',
            'destination.id' => 'required|integer|min:1',
            'destination.label' => 'required|string|max:500',
            'destination.city_name' => 'required|string|max:255',
            'destination.province_name' => 'sometimes|nullable|string|max:255',
            'destination.district_name' => 'sometimes|nullable|string|max:255',
            'destination.subdistrict_name' => 'sometimes|nullable|string|max:255',
            'destination.zip_code' => 'sometimes|nullable|string|max:10',
        ]);
        $data['shipping_city'] = $data['destination']['city_name'];
        $data['fingerprint'] = $this->fingerprint($data);
        return $data;
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        return DB::transaction(function () use ($request, $data) {
            $request->user()->newQuery()->whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $query = $request->user()->shippingAddresses();
            $existing = $query->where('fingerprint', $data['fingerprint'])->first();
            if ($existing) return response()->json(['address' => $existing]);
            if ($request->user()->shippingAddresses()->count() >= 20) {
                throw ValidationException::withMessages(['shipping_address' => 'Maksimal 20 alamat tersimpan. Hapus alamat yang tidak digunakan.']);
            }
            $address = $request->user()->shippingAddresses()->create($data);
            return response()->json(['address' => $address], 201);
        });
    }

    public function update(Request $request, $id)
    {
        $address = $request->user()->shippingAddresses()->findOrFail($id);
        $data = $this->validated($request);
        return DB::transaction(function () use ($request, $address, $data) {
            $request->user()->newQuery()->whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            if ($request->user()->shippingAddresses()->where('fingerprint', $data['fingerprint'])->whereKeyNot($address->id)->exists()) {
                throw ValidationException::withMessages(['shipping_address' => 'Alamat yang sama sudah tersimpan. Pilih alamat tersebut.']);
            }
            $address->update($data);
            return response()->json(['address' => $address->fresh()]);
        });
    }

    public function destroy(Request $request, $id)
    {
        $request->user()->shippingAddresses()->findOrFail($id)->delete();
        return response()->noContent();
    }
}

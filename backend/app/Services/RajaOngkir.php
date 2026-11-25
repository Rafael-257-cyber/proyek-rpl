<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class RajaOngkir
{
    private function request(string $path, array $params, bool $post = false): array
    {
        if (!config('rajaongkir.api_key') || !config('rajaongkir.origin_id')) {
            throw new HttpResponseException(response()->json(['message' => 'Konfigurasi pengiriman toko belum lengkap.'], 503));
        }
        try {
            $client = Http::timeout(15)->connectTimeout(5)->acceptJson()
                ->withHeaders(['key' => config('rajaongkir.api_key')]);
            $url = rtrim(config('rajaongkir.base_url'), '/').'/'.$path;
            $response = $post ? $client->asForm()->post($url, $params) : $client->get($url, $params);
            if (!$response->successful() || (int) $response->json('meta.code') !== 200 || !is_array($response->json('data'))) {
                throw new \RuntimeException('Invalid shipping response');
            }
            return $response->json('data');
        } catch (\Exception $exception) {
            throw new HttpResponseException(response()->json([
                'message' => 'Layanan ongkir belum dapat dihubungi. Coba lagi; ongkir belum diterapkan.',
            ], 502));
        }
    }

    public function destinations(string $search): array
    {
        $key = 'rajaongkir:destination:'.hash('sha256', config('rajaongkir.base_url').'|'.$search);
        return Cache::remember($key, now()->addHour(), fn () => $this->request(
            'destination/domestic-destination', ['search' => $search, 'limit' => 10, 'offset' => 0]
        ));
    }

    public function weight(array $items): int
    {
        $products = Product::whereIn('id', array_column($items, 'product_id'))->get()->keyBy('id');
        $weight = 0;
        foreach ($items as $item) {
            $product = $products->get($item['product_id']);
            if (!$product || !$product->weight_grams || $product->weight_grams < 1) {
                throw ValidationException::withMessages(['items' => 'Berat produk '.($product?->name ?? $item['product_id']).' belum diisi. Hubungi admin toko.']);
            }
            if ($product->stock < $item['quantity']) {
                throw ValidationException::withMessages(['items' => 'Stok produk '.$product->name.' tidak mencukupi.']);
            }
            $weight += $product->weight_grams * $item['quantity'];
        }
        if ($weight < 1 || $weight > 100000) {
            throw ValidationException::withMessages(['items' => 'Total berat pengiriman harus antara 1 gram dan 100 kg.']);
        }
        return $weight;
    }

    public function rates(int $destination, array $items, string $courier): array
    {
        if (!in_array($courier, config('rajaongkir.couriers'), true)) {
            throw ValidationException::withMessages(['courier' => 'Kurir tidak tersedia.']);
        }
        $weight = $this->weight($items);
        $rows = $this->request('calculate/domestic-cost', [
            'origin' => (int) config('rajaongkir.origin_id'), 'destination' => $destination,
            'weight' => $weight, 'courier' => $courier, 'price' => 'lowest',
        ], true);
        $rates = [];
        foreach ($rows as $row) {
            // Vehicle transport services are not parcel options for the store.
            if (($row['code'] ?? '') !== $courier || !is_numeric($row['cost'] ?? null)
                || $row['cost'] <= 0 || empty($row['service']) || preg_match('/[<>]/', $row['service'])) continue;
            $rates[] = [
                'courier' => $row['code'], 'name' => $row['name'] ?? strtoupper($courier),
                'service' => $row['service'], 'description' => $row['description'] ?? '',
                'cost' => (int) $row['cost'], 'estimate' => $row['etd'] ?? '',
            ];
        }
        return ['origin_id' => (int) config('rajaongkir.origin_id'), 'destination_id' => $destination,
            'weight_grams' => $weight, 'rates' => $rates];
    }
}

<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;

class MidtransStatus
{
    public function fetch(Order $order, ?string $transactionId = null): object
    {
        $invoice = $order->midtrans_order_id ?: 'INV-'.$order->id;
        \Midtrans\Config::$serverKey = config('midtrans.server_key');
        \Midtrans\Config::$isProduction = config('midtrans.is_production');
        try {
            $result = \Midtrans\Transaction::status($transactionId ?: $invoice);
        } catch (\Exception $exception) {
            if ((int) $exception->getCode() !== 404 || !$order->snap_token) throw $exception;
            // Some Snap payments are confirmed before Core API can find the invoice.
            // Query Midtrans directly using the server-stored token, never browser status.
            $host = config('midtrans.is_production') ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com';
            $response = Http::timeout(10)->acceptJson()->get($host.'/snap/v1/transactions/'.rawurlencode($order->snap_token).'/status');
            if (!$response->successful() || !is_array($response->json())) throw $exception;
            $result = (object) $response->json();
        }
        if (!preg_match('/^INV-'.$order->id.'(?:-[a-f0-9]{16})?$/', (string) ($result->order_id ?? ''))
            || !isset($result->gross_amount)
            || (float) $result->gross_amount !== (float) $order->total_price) {
            throw new \RuntimeException('Payment does not match this order', 409);
        }
        return $result;
    }
}

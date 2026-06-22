<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class PaymentCallbackController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $notification = json_decode($payload);

        $validSignatureKey = hash("sha512", $notification->order_id . $notification->status_code . $notification->gross_amount . config('midtrans.server_key'));

        if ($notification->signature_key != $validSignatureKey) {
            return response(['message' => 'Invalid signature'], 403);
        }

        $order = Order::find($notification->order_id);

        if (!$order) {
            return response(['message' => 'Order not found'], 404);
        }

        $transactionStatus = $notification->transaction_status;
        $fraudStatus = $notification->fraud_status ?? null;

        if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
            if ($fraudStatus == 'challenge') {
                $order->update([
                    'status' => 'pending_verification',
                    'payment_status' => 'pending_verification',
                ]);
            } else {
                $order->update([
                    'status' => 'processing',
                    'payment_status' => 'paid',
                ]);
            }
        } else if ($transactionStatus == 'cancel' || $transactionStatus == 'deny' || $transactionStatus == 'expire') {
            $order->update([
                'status' => 'cancelled',
                'payment_status' => 'failed',
            ]);
        } else if ($transactionStatus == 'pending') {
            $order->update([
                'payment_status' => 'pending',
            ]);
        }

        return response()->json(['message' => 'Success']);
    }
}

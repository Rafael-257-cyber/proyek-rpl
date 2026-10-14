<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class PaymentCallbackController extends Controller
{
    public function handle(Request $request)
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
            $request->validate([
                'order_id' => 'required|string',
                'status_code' => 'required',
                'gross_amount' => 'required|numeric',
                'signature_key' => 'required|string',
                'transaction_status' => 'required|string',
            ]);
            $notification = (object) $request->all();

            $validSignatureKey = hash("sha512", $notification->order_id . $notification->status_code . $notification->gross_amount . config('midtrans.server_key'));

            if (!hash_equals($validSignatureKey, $notification->signature_key)) {
                return response(['message' => 'Invalid signature'], 403);
            }

            if (!preg_match('/^INV-(\d+)(?:-[a-f0-9]{16})?$/', $notification->order_id, $matches)) {
                return response()->json(['message' => 'Invalid order ID'], 400);
            }
            $order = Order::lockForUpdate()->find($matches[1]);

            if (!$order) {
                return response(['message' => 'Order not found'], 404);
            }

            if ((int) $notification->gross_amount !== (int) $order->total_price) {
                return response()->json(['message' => 'Invalid payment amount'], 400);
            }
            // Repeated or delayed notifications must not undo payment or shipping progress.
            if ($order->payment_status === 'paid') {
                return response()->json(['message' => 'Success']);
            }

            $activeInvoice = $order->midtrans_order_id ?: 'INV-' . $order->id;
            if ($notification->order_id !== $activeInvoice && !in_array($notification->transaction_status, ['settlement', 'capture'], true)) {
                return response()->json(['message' => 'Superseded payment attempt ignored']);
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
        });
    }
}

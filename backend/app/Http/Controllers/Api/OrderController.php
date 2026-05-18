<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Notifications\OrderNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Create order (Checkout)
     */
    public function checkout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string',
            'shipping_city' => 'required|string',
            'shipping_phone' => 'required|string',
            'payment_method' => 'required|in:transfer,cod,ewallet',
            'shipping_cost' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $shippingCost = (float) $request->input('shipping_cost', 15000);

        try {
            $order = DB::transaction(function () use ($request, $shippingCost) {
                $subtotal = 0;
                $orderItems = [];

                foreach ($request->items as $item) {
                    $product = Product::find($item['product_id']);

                    if (!$product || $product->stock < $item['quantity']) {
                        $productName = $product?->name ?? $item['product_id'];
                        throw new \RuntimeException('Product ' . $productName . ' stock not available');
                    }

                    $subtotal += $product->price * $item['quantity'];
                    $orderItems[] = [
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'price' => $product->price,
                    ];
                }

                $order = Order::create([
                    'user_id' => $request->user()->id,
                    'total_price' => $subtotal + $shippingCost,
                    'ongkir' => $shippingCost,
                    'status' => 'pending_payment',
                    'payment_status' => 'pending',
                    'payment_method' => $request->payment_method,
                    'shipping_address' => $request->shipping_address,
                    'shipping_city' => $request->shipping_city,
                    'shipping_phone' => $request->shipping_phone,
                    'payment_due_at' => now()->addHours(24),
                ]);

                foreach ($orderItems as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'price' => $item['price'],
                    ]);

                    Product::where('id', $item['product_id'])->decrement('stock', $item['quantity']);
                }

                return $order->load('items.product', 'user');
            });
        } catch (\RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 400);
        }

        $this->notifyOrderUser(
            $order,
            'Pesanan berhasil dibuat',
            'Pesanan #' . $order->id . ' berhasil dibuat. Silakan selesaikan pembayaran sebelum ' . optional($order->payment_due_at)->format('d M Y H:i') . '.'
        );

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order->load('items'),
            'total_price' => $order->total_price
        ], 201);
    }

    /**
     * Get user orders
     */
    public function userOrders(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with('items.product')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'orders' => $orders
        ], 200);
    }

    /**
     * Get order details
     */
    public function show(Request $request, $orderId)
    {
        $order = Order::where('id', $orderId)
            ->where('user_id', $request->user()->id)
            ->with('items.product')
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json([
            'order' => $order
        ], 200);
    }

    /**
     * Upload payment proof
     */
    public function uploadPaymentProof(Request $request, $orderId)
    {
        $validator = Validator::make($request->all(), [
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order = Order::where('id', $orderId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Allow upload when order waiting for payment or COD (courier may upload later via admin)
        if (!in_array($order->status, ['pending_payment', 'pending_verification'])) {
            // still allow upload if status is pending_payment or pending_verification
            return response()->json(['message' => 'Order status cannot accept payment proof'], 400);
        }

        // Store payment proof
        $path = $request->file('payment_proof')->store('payment_proofs', 'public');

        $uploader = $request->user()->role ?? 'user';

        $order->update([
            'bukti_bayar' => $path,
            'payment_status' => 'pending_verification',
            'payment_proof_uploaded_by' => $uploader,
            'payment_proof_uploaded_at' => now(),
            'status' => 'pending_verification',
        ]);

        $this->notifyOrderUser(
            $order->fresh('user'),
            'Bukti pembayaran diterima',
            'Bukti pembayaran untuk pesanan #' . $order->id . ' sudah kami terima dan sedang menunggu verifikasi.'
        );

        return response()->json([
            'message' => 'Payment proof uploaded successfully',
            'order' => $order
        ], 200);
    }

    /**
     * Cancel order (only pending_payment status)
     */
    public function cancel(Request $request, $orderId)
    {
        $order = Order::where('id', $orderId)
            ->where('user_id', $request->user()->id)
            ->with('items')
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($order->status !== 'pending_payment') {
            return response()->json(['message' => 'Only pending orders can be cancelled'], 400);
        }

        // Restore stock
        foreach ($order->items as $item) {
            $product = Product::find($item->product_id);
            $product->update(['stock' => $product->stock + $item->quantity]);
        }

        $order->update(['status' => 'cancelled']);

        $this->notifyOrderUser(
            $order->fresh('user'),
            'Pesanan dibatalkan',
            'Pesanan #' . $order->id . ' sudah dibatalkan dan stok produk dikembalikan.'
        );

        return response()->json([
            'message' => 'Order cancelled successfully',
            'order' => $order
        ], 200);
    }

    protected function notifyOrderUser(?Order $order, string $title, string $message): void
    {
        if (!$order || !$order->user) {
            return;
        }

        try {
            $order->user->notify(new OrderNotification(
                title: $title,
                message: $message,
                orderId: $order->id,
                actionUrl: config('app.url') . '/orders/' . $order->id,
            ));
        } catch (\Throwable $exception) {
            report($exception);
        }
    }
}

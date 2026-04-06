<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Create order (Checkout)
     */
    public function checkout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string',
            'shipping_city' => 'required|string',
            'shipping_phone' => 'required|string',
            'payment_method' => 'required|in:transfer,cod',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $totalPrice = 0;
        $orderItems = [];

        // Validate stock and calculate total
        foreach ($request->items as $item) {
            $product = Product::find($item['product_id']);

            if (!$product && $product->stock < $item['quantity']) {
                return response()->json([
                    'message' => 'Product ' . $product->name . ' stock not available'
                ], 400);
            }

            $totalPrice += $product->price * $item['quantity'];
            $orderItems[] = [
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $product->price,
            ];
        }

        // Create order
        $order = Order::create([
            'user_id' => $request->user()->id,
            'total_price' => $totalPrice,
            'status' => 'pending_payment',
            'payment_method' => $request->payment_method,
            'shipping_address' => $request->shipping_address,
            'shipping_city' => $request->shipping_city,
            'shipping_phone' => $request->shipping_phone,
        ]);

        // Create order items and reduce stock
        foreach ($orderItems as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);

            // Reduce product stock
            $product = Product::find($item['product_id']);
            $product->update(['stock' => $product->stock - $item['quantity']]);
        }

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order->load('items'),
            'total_price' => $totalPrice
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

        if ($order->status !== 'pending_payment') {
            return response()->json(['message' => 'Order status cannot accept payment proof'], 400);
        }

        // Store payment proof
        $path = $request->file('payment_proof')->store('payment_proofs', 'public');

        $order->update([
            'payment_proof' => $path,
            'status' => 'pending_verification',
        ]);

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

        return response()->json([
            'message' => 'Order cancelled successfully',
            'order' => $order
        ], 200);
    }
}

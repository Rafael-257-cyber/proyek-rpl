<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Get all orders (with filters)
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $status = $request->input('status');
        $search = $request->input('search');

        $query = Order::with('user', 'items.product');

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where('id', 'like', '%' . $search . '%')
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('name', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%');
                  });
        }

        $orders = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $orders->items(),
            'pagination' => [
                'total' => $orders->total(),
                'per_page' => $orders->perPage(),
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
            ]
        ], 200);
    }

    /**
     * Get single order
     */
    public function show($id)
    {
        $order = Order::with('user', 'items.product')->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json(['order' => $order], 200);
    }

    /**
     * Verify payment (approve)
     */
    public function verifyPayment(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($order->status !== 'pending_verification') {
            return response()->json([
                'message' => 'Only pending verification orders can be approved'
            ], 400);
        }

        $order->update(['status' => 'payment_confirmed']);

        return response()->json([
            'message' => 'Payment verified successfully',
            'order' => $order,
        ], 200);
    }

    /**
     * Reject payment
     */
    public function rejectPayment(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($order->status !== 'pending_verification') {
            return response()->json([
                'message' => 'Only pending verification orders can be rejected'
            ], 400);
        }

        // Restore stock
        foreach ($order->items as $item) {
            $product = $item->product;
            $product->update(['stock' => $product->stock + $item->quantity]);
        }

        $order->update(['status' => 'pending_payment']);

        return response()->json([
            'message' => 'Payment rejected, order reset to pending payment',
            'order' => $order,
        ], 200);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:payment_confirmed,processing,shipped,delivered,cancelled',
            'tracking_number' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $updateData = ['status' => $request->status];

        if ($request->status === 'shipped' && $request->tracking_number) {
            $updateData['tracking_number'] = $request->tracking_number;
            $updateData['shipped_at'] = now();
        }

        if ($request->status === 'delivered') {
            $updateData['delivered_at'] = now();
        }

        $order->update($updateData);

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order,
        ], 200);
    }

    /**
     * Cancel order
     */
    public function cancel(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if (in_array($order->status, ['shipped', 'delivered', 'cancelled'])) {
            return response()->json([
                'message' => 'Cannot cancel orders that are shipped, delivered, or already cancelled'
            ], 400);
        }

        // Restore stock
        foreach ($order->items as $item) {
            $product = $item->product;
            $product->update(['stock' => $product->stock + $item->quantity]);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Order cancelled successfully',
            'order' => $order,
        ], 200);
    }
}

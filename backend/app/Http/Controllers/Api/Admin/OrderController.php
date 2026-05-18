<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Notifications\OrderNotification;
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

        if ($order->status !== 'pending_verification' && $order->payment_status !== 'pending_verification') {
            return response()->json([
                'message' => 'Only pending verification orders can be approved'
            ], 400);
        }

        $order->update([
            'payment_status' => 'paid',
            'status' => 'processing',
        ]);

        $this->notifyOrderUser(
            $order->fresh('user'),
            'Pembayaran terverifikasi',
            'Pembayaran untuk pesanan #' . $order->id . ' sudah diverifikasi dan pesanan mulai diproses.'
        );

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

        $this->notifyOrderUser(
            $order->fresh('user'),
            'Pembayaran ditolak',
            'Pembayaran untuk pesanan #' . $order->id . ' ditolak. Silakan unggah bukti pembayaran yang valid.'
        );

        return response()->json([
            'message' => 'Payment rejected, order reset to pending payment',
            'order' => $order,
        ], 200);
    }

    /**
     * Admin upload proof (for COD courier upload)
     */
    public function uploadProof(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $path = $request->file('payment_proof')->store('payment_proofs', 'public');

        $order->update([
            'bukti_bayar' => $path,
            'payment_status' => 'paid',
            'payment_proof_uploaded_by' => 'courier',
            'payment_proof_uploaded_at' => now(),
        ]);

        $this->notifyOrderUser(
            $order->fresh('user'),
            'Pembayaran diterima',
            'Bukti pembayaran untuk pesanan #' . $order->id . ' sudah diterima dan status pembayaran diperbarui.'
        );

        return response()->json([
            'message' => 'Payment proof uploaded and marked as paid',
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

        $this->notifyOrderUser(
            $order->fresh('user'),
            'Status pesanan diperbarui',
            'Status pesanan #' . $order->id . ' sekarang menjadi ' . $request->status . '.'
        );

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

        $this->notifyOrderUser(
            $order->fresh('user'),
            'Pesanan dibatalkan oleh admin',
            'Pesanan #' . $order->id . ' dibatalkan dan stok produk telah dikembalikan.'
        );

        return response()->json([
            'message' => 'Order cancelled successfully',
            'order' => $order,
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

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
    public function renewPaymentSession(Request $request, $orderId)
    {
        return DB::transaction(function () use ($request, $orderId) {
            $order = Order::where('user_id', $request->user()->id)->lockForUpdate()->findOrFail($orderId);
            if ($order->status !== 'pending_payment' || $order->payment_status !== 'pending' || !$order->snap_token) {
                return response()->json(['message' => 'Metode hanya bisa diganti sebelum pembayaran berhasil.'], 409);
            }

            \Midtrans\Config::$serverKey = config('midtrans.server_key');
            \Midtrans\Config::$isProduction = config('midtrans.is_production');
            \Midtrans\Config::$isSanitized = config('midtrans.is_sanitized');
            \Midtrans\Config::$is3ds = config('midtrans.is_3ds');
            $oldInvoice = $order->midtrans_order_id ?: 'INV-' . $order->id;
            $oldStatus = null;
            try {
                $status = app(\App\Services\MidtransStatus::class)->fetch($order);
                $oldStatus = $status->transaction_status ?? '';
                if (!in_array($oldStatus, ['pending', 'deny', 'cancel', 'expire'], true)) {
                    return response()->json(['message' => 'Pembayaran sudah diterima atau sedang diverifikasi. Silakan cek status pesanan.'], 409);
                }
            } catch (\Exception $exception) {
                if ((int) $exception->getCode() !== 404) {
                    return response()->json(['message' => 'Status pembayaran belum dapat diperiksa. Coba lagi sebentar.'], 502);
                }
            }

            $invoice = 'INV-' . $order->id . '-' . bin2hex(random_bytes(8));
            try {
                // Prepare a new, unique payment attempt before disabling the old one.
                // If token creation fails, the existing payment remains usable.
                $token = \Midtrans\Snap::getSnapToken([
                    'transaction_details' => ['order_id' => $invoice, 'gross_amount' => (int) $order->total_price],
                    'customer_details' => [
                        'first_name' => $order->shipping_name ?: $request->user()->name,
                        'email' => $request->user()->email,
                        'phone' => $order->shipping_phone,
                    ],
                    'callbacks' => ['finish' => env('FRONTEND_URL', 'http://localhost:3000') . '/orders/' . $order->id],
                ]);
                if ($oldStatus === 'pending') {
                    if ((string) \Midtrans\Transaction::cancel($oldInvoice) !== '200') {
                        throw new \RuntimeException('Pending transaction cancellation was not confirmed');
                    }
                } elseif ($oldStatus === null) {
                    // Re-creating the unused old invoice invalidates its previous token.
                    \Midtrans\Snap::getSnapToken([
                        'transaction_details' => ['order_id' => $oldInvoice, 'gross_amount' => (int) $order->total_price],
                    ]);
                }
                $order->update(['snap_token' => $token, 'midtrans_order_id' => $invoice]);
                return response()->json(['order' => $order, 'snap_token' => $token]);
            } catch (\Exception $exception) {
                \Illuminate\Support\Facades\Log::warning('Midtrans payment session change failed', [
                    'order_id' => $order->id, 'code' => $exception->getCode(),
                ]);
                return response()->json(['message' => 'Metode belum dapat diganti. Pembayaran mungkin sudah selesai atau layanan sedang bermasalah. Kembali ke pesanan untuk memeriksa status.'], 502);
            }
        });
    }

    /**
     * Create order (Checkout)
     */
    public function checkout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1|max:100',
            'items.*.product_id' => 'required|integer|distinct|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1|max:1000',
            'shipping_name' => 'required|string',
            'shipping_address' => 'required|string',
            'shipping_city' => 'required|string',
            'shipping_phone' => 'required|string',
            'payment_method' => 'required|in:transfer,cod,ewallet',
            'shipping_destination_id' => 'required|integer|min:1',
            'shipping_cost' => 'required|integer|min:1',
            'shipping_courier' => ['required', 'string', \Illuminate\Validation\Rule::in(config('rajaongkir.couriers'))],
            'shipping_service' => 'required|string|max:100',
            'shipping_estimate' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $quote = app(\App\Services\RajaOngkir::class)->rates(
            (int) $request->shipping_destination_id, $request->items, $request->shipping_courier
        );
        $shippingRate = collect($quote['rates'])->firstWhere('service', $request->shipping_service);
        if (!$shippingRate || $shippingRate['cost'] !== (int) $request->shipping_cost) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'shipping_cost' => 'Tarif atau layanan berubah. Periksa ongkir dan pilih layanan kembali.',
            ]);
        }
        $shippingCost = $shippingRate['cost'];

        try {
            $order = DB::transaction(function () use ($request, $shippingCost, $shippingRate, $quote) {
                $subtotal = 0;
                $orderItems = [];
                $weight = 0;

                foreach (collect($request->items)->sortBy('product_id') as $item) {
                    $product = Product::lockForUpdate()->find($item['product_id']);

                    if (!$product || $product->stock < $item['quantity']) {
                        $productName = $product?->name ?? $item['product_id'];
                        throw new \RuntimeException('Product ' . $productName . ' stock not available');
                    }

                    $weight += (int) $product->weight_grams * $item['quantity'];
                    $subtotal += $product->price * $item['quantity'];
                    $orderItems[] = [
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'price' => $product->price,
                    ];
                }

                if ($weight !== $quote['weight_grams']) {
                    throw \Illuminate\Validation\ValidationException::withMessages(['shipping_cost' => 'Berat produk berubah. Periksa ongkir kembali.']);
                }
                $order = Order::create([
                    'user_id' => $request->user()->id,
                    'shipping_name' => $request->shipping_name,
                    'shipping_destination_id' => $quote['destination_id'],
                    'shipping_weight_grams' => $quote['weight_grams'],
                    'total_price' => $subtotal + $shippingCost,
                    'ongkir' => $shippingCost,
                    'status' => 'pending_payment',
                    'payment_status' => 'pending',
                    'payment_method' => $request->payment_method,
                    'shipping_address' => $request->shipping_address,
                    'shipping_city' => $request->shipping_city,
                    'shipping_phone' => $request->shipping_phone,
                    'shipping_courier' => $shippingRate['courier'],
                    'shipping_service' => $shippingRate['service'],
                    'shipping_estimate' => $shippingRate['estimate'],
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

                // Configure Midtrans
                \Midtrans\Config::$serverKey = config('midtrans.server_key');
                \Midtrans\Config::$isProduction = config('midtrans.is_production');
                \Midtrans\Config::$isSanitized = config('midtrans.is_sanitized');
                \Midtrans\Config::$is3ds = config('midtrans.is_3ds');

                $params = array(
                    'transaction_details' => array(
                        'order_id' => 'INV-' . $order->id,
                        'gross_amount' => (int) $order->total_price,
                    ),
                    'customer_details' => array(
                        'first_name' => $order->user->name,
                        'email' => $order->user->email,
                        'phone' => $order->shipping_phone,
                    ),
                    'callbacks' => array(
                        'finish' => env('FRONTEND_URL', 'http://localhost:3000') . '/orders/' . $order->id,
                        'unfinish' => env('FRONTEND_URL', 'http://localhost:3000') . '/orders/' . $order->id,
                        'error' => env('FRONTEND_URL', 'http://localhost:3000') . '/orders/' . $order->id,
                    )
                );

                try {
                    $snapToken = \Midtrans\Snap::getSnapToken($params);
                    $order->update(['snap_token' => $snapToken]);
                } catch (\Exception $e) {
                    throw new \RuntimeException('Failed to get payment token: ' . $e->getMessage());
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

    public function updatePaymentMethod(Request $request, $orderId)
    {
        $request->validate([
            'payment_method' => 'required|string|in:transfer,cod,ewallet,bank_transfer,credit_card,qris,midtrans',
        ]);

        $order = Order::where('id', $orderId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($order->status !== 'pending_payment') {
            return response()->json(['message' => 'Hanya pesanan yang belum dibayar yang bisa diganti metode pembayarannya'], 400);
        }

        $order->update([
            'payment_method' => $request->payment_method
        ]);

        return response()->json([
            'message' => 'Metode pembayaran berhasil diperbarui',
            'order' => $order
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

        // Auto-sync status with Midtrans for local development/fallback
        if ($order->snap_token && in_array($order->payment_status, ['pending', 'pending_verification'], true)) {
            try {
                \Midtrans\Config::$serverKey = config('midtrans.server_key');
                \Midtrans\Config::$isProduction = config('midtrans.is_production');
                $statusResponse = app(\App\Services\MidtransStatus::class)->fetch($order);

                $transactionStatus = $statusResponse->transaction_status;
                $fraudStatus = $statusResponse->fraud_status ?? null;

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
                }
            } catch (\Exception $e) {
                // Ignore if Midtrans throws 404 meaning transaction not started
            }
        }

        return response()->json([
            'order' => $order
        ], 200);
    }

    public function syncMidtrans(Request $request, $orderId)
    {
        $request->validate(['transaction_id' => 'nullable|string|max:100|regex:/^[a-zA-Z0-9_-]+$/']);
        $order = Order::where('user_id', $request->user()->id)->find($orderId);
        if (!$order) return response()->json(['message' => 'Order not found'], 404);
        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Order already paid', 'order' => $order]);
        }

        \Midtrans\Config::$serverKey = config('midtrans.server_key');
        \Midtrans\Config::$isProduction = config('midtrans.is_production');
        try {
            // Snap may provide a transaction UUID before lookup by invoice is available.
            $result = app(\App\Services\MidtransStatus::class)->fetch($order, $request->input('transaction_id'));
            $remoteInvoice = (string) ($result->order_id ?? '');
            if (!preg_match('/^INV-' . $order->id . '(?:-[a-f0-9]{16})?$/', $remoteInvoice)
                || !isset($result->gross_amount)
                || (float) $result->gross_amount !== (float) $order->total_price) {
                return response()->json(['message' => 'Transaksi pembayaran tidak sesuai dengan pesanan.'], 409);
            }

            $order = DB::transaction(function () use ($order, $result, $remoteInvoice) {
                $locked = Order::lockForUpdate()->findOrFail($order->id);
                if ($locked->payment_status === 'paid') return $locked;
                $status = $result->transaction_status ?? '';
                if (in_array($status, ['settlement', 'capture'], true)) {
                    $challenge = ($result->fraud_status ?? null) === 'challenge';
                    $locked->update([
                        'status' => $challenge ? 'pending_verification' : 'processing',
                        'payment_status' => $challenge ? 'pending_verification' : 'paid',
                    ]);
                } elseif ($remoteInvoice === ($locked->midtrans_order_id ?: 'INV-' . $locked->id)
                    && in_array($status, ['cancel', 'deny', 'expire'], true)) {
                    $locked->update(['status' => 'cancelled', 'payment_status' => 'failed']);
                }
                return $locked;
            });
            return response()->json([
                'message' => $order->payment_status === 'paid' ? 'Pembayaran berhasil dikonfirmasi.' : 'Midtrans belum mengonfirmasi pembayaran. Status akan diperiksa otomatis.',
                'order' => $order,
            ]);
        } catch (\Exception $exception) {
            \Illuminate\Support\Facades\Log::warning('Midtrans status verification failed', [
                'order_id' => $order->id, 'code' => $exception->getCode(),
            ]);
            return response()->json(['message' => (int) $exception->getCode() === 409 ? 'Transaksi pembayaran tidak sesuai dengan pesanan.' : 'Konfirmasi pembayaran belum diterima dari Midtrans. Status akan diperiksa otomatis.'], (int) $exception->getCode() === 409 ? 409 : 502);
        }
    }

    /**
     * Upload payment proof
     */
    public function uploadPaymentProof(Request $request, $orderId)
    {
        $validator = Validator::make($request->all(), [
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ], [
            'payment_proof.required' => 'Pilih file bukti pembayaran terlebih dahulu.',
            'payment_proof.image' => 'Bukti pembayaran harus berupa gambar.',
            'payment_proof.mimes' => 'Bukti pembayaran harus berformat JPG, JPEG, atau PNG.',
            'payment_proof.max' => 'Ukuran bukti pembayaran maksimal 2 MB.',
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

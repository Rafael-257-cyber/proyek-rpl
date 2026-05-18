<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\Product;
use App\Notifications\OrderNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AutoCancelPendingOrders extends Command
{
    protected $signature = 'orders:auto-cancel-pending';

    protected $description = 'Cancel pending payment orders older than 24 hours and restore stock';

    public function handle(): int
    {
        $orders = Order::with('user', 'items')
            ->where('status', 'pending_payment')
            ->whereNotNull('payment_due_at')
            ->where('payment_due_at', '<=', now())
            ->get();

        $cancelledCount = 0;

        foreach ($orders as $order) {
            DB::transaction(function () use ($order, &$cancelledCount) {
                $freshOrder = Order::with('user', 'items')->find($order->id);

                if (!$freshOrder || $freshOrder->status !== 'pending_payment') {
                    return;
                }

                foreach ($freshOrder->items as $item) {
                    Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                }

                $freshOrder->update([
                    'status' => 'cancelled',
                    'payment_status' => 'failed',
                ]);

                if ($freshOrder->user) {
                    try {
                        $freshOrder->user->notify(new OrderNotification(
                            title: 'Pesanan dibatalkan otomatis',
                            message: 'Pesanan #' . $freshOrder->id . ' dibatalkan otomatis karena melewati batas waktu pembayaran 24 jam.',
                            orderId: $freshOrder->id,
                            actionUrl: config('app.url') . '/orders/' . $freshOrder->id,
                        ));
                    } catch (\Throwable $exception) {
                        report($exception);
                    }
                }

                $cancelledCount++;
            });
        }

        $this->info('Auto-cancel selesai. Total pesanan dibatalkan: ' . $cancelledCount);

        return self::SUCCESS;
    }
}
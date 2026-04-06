<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function getStats(Request $request)
    {
        // Get date range from query (default: today)
        $startDate = $request->query('start_date', Carbon::today());
        $endDate = $request->query('end_date', Carbon::today()->endOfDay());

        // Total Sales
        $totalSales = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', '!=', 'cancelled')
            ->sum('total_price');

        // Total Orders
        $totalOrders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', '!=', 'cancelled')
            ->count();

        // Pending Payment Orders
        $pendingPayment = Order::where('status', 'pending_payment')->count();

        // Total Products
        $totalProducts = Product::count();

        // Low Stock Products (< 5)
        $lowStockProducts = Product::where('stock', '<', 5)->count();

        // Revenue by Status
        $revenueByStatus = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', '!=', 'cancelled')
            ->groupBy('status')
            ->selectRaw('status, SUM(total_price) as total')
            ->get();

        // Recent Orders (last 10)
        $recentOrders = Order::with('user', 'items.product')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'user_name' => $order->user->name,
                    'total_price' => $order->total_price,
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                    'item_count' => $order->items->count(),
                ];
            });

        return response()->json([
            'stats' => [
                'total_sales' => $totalSales,
                'total_orders' => $totalOrders,
                'pending_payment' => $pendingPayment,
                'total_products' => $totalProducts,
                'low_stock_products' => $lowStockProducts,
            ],
            'revenue_by_status' => $revenueByStatus,
            'recent_orders' => $recentOrders,
        ], 200);
    }

    /**
     * Get sales chart data (daily, weekly, monthly)
     */
    public function getSalesChart(Request $request)
    {
        $period = $request->query('period', 'daily'); // daily, weekly, monthly
        $days = $request->query('days', 30);

        $startDate = Carbon::now()->subDays($days);

        $query = Order::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', $startDate)
            ->groupBy(\DB::raw('DATE(created_at)'))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders, SUM(total_price) as revenue')
            ->orderBy('date', 'asc');

        if ($period === 'weekly') {
            $query = Order::where('status', '!=', 'cancelled')
                ->where('created_at', '>=', $startDate)
                ->groupBy(\DB::raw('WEEK(created_at)'))
                ->selectRaw('WEEK(created_at) as week, COUNT(*) as orders, SUM(total_price) as revenue')
                ->orderBy('week', 'asc');
        }

        $data = $query->get();

        return response()->json([
            'chart_data' => $data,
            'period' => $period,
        ], 200);
    }
}

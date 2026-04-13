<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportExportController extends Controller
{
    /**
     * Export sales report as PDF
     */
    public function exportSalesPDF(Request $request)
    {
        try {
            // Get period from query
            $month = $request->query('month', date('m'));
            $year = $request->query('year', date('Y'));

            // Calculate date range
            $startDate = Carbon::createFromFormat('Y-m-d', "{$year}-{$month}-01")->startOfDay();
            $endDate = $startDate->copy()->endOfMonth();

            // Get sales data
            $orders = Order::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', '!=', 'cancelled')
                ->with('user', 'items.product')
                ->orderBy('created_at', 'desc')
                ->get();

            // Calculate statistics
            $totalSales = (int) $orders->sum('total_price');
            $totalOrders = $orders->count();
            $averageOrder = $totalOrders > 0 ? (int) ($totalSales / $totalOrders) : 0;

            // Prepare data
            $monthName = $this->getMonthName($month);
            $generatedAt = now()->format('d M Y, H:i');

            // Build HTML piece by piece to avoid syntax errors
            $html = '<!DOCTYPE html>' . "\n";
            $html .= '<html lang="id">' . "\n";
            $html .= '<head>' . "\n";
            $html .= '    <meta charset="UTF-8">' . "\n";
            $html .= '    <title>Laporan Penjualan</title>' . "\n";
            $html .= '    <style>' . "\n";
            $html .= '        * { margin: 0; padding: 0; box-sizing: border-box; }' . "\n";
            $html .= '        body { font-family: Arial, sans-serif; color: #333; font-size: 11px; }' . "\n";
            $html .= '        .container { padding: 20px; }' . "\n";
            $html .= '        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1e40af; padding-bottom: 15px; }' . "\n";
            $html .= '        .header h1 { font-size: 24px; color: #1e40af; margin-bottom: 5px; }' . "\n";
            $html .= '        .header p { color: #666; font-size: 12px; }' . "\n";
            $html .= '        .generated { text-align: right; font-size: 10px; color: #999; }' . "\n";
            $html .= '        .stats { display: flex; gap: 15px; margin-bottom: 30px; }' . "\n";
            $html .= '        .stat-box { flex: 1; background: #f3f4f6; border-left: 4px solid #1e40af; padding: 15px; }' . "\n";
            $html .= '        .stat-label { color: #666; font-size: 10px; font-weight: bold; text-transform: uppercase; }' . "\n";
            $html .= '        .stat-value { font-size: 16px; font-weight: bold; color: #1e40af; margin-top: 5px; }' . "\n";
            $html .= '        .section { margin-bottom: 30px; }' . "\n";
            $html .= '        .section h2 { font-size: 14px; color: #1e40af; margin-bottom: 15px; border-bottom: 2px solid #ddd; padding-bottom: 8px; }' . "\n";
            $html .= '        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }' . "\n";
            $html .= '        table thead { background-color: #1e40af; color: white; }' . "\n";
            $html .= '        table th { padding: 10px; text-align: left; font-weight: bold; font-size: 11px; }' . "\n";
            $html .= '        table td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }' . "\n";
            $html .= '        table tbody tr:nth-child(even) { background-color: #f9fafb; }' . "\n";
            $html .= '        .center { text-align: center; }' . "\n";
            $html .= '        .right { text-align: right; }' . "\n";
            $html .= '        .summary { background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; margin-top: 20px; }' . "\n";
            $html .= '        .summary h3 { color: #1e40af; font-size: 12px; margin-bottom: 10px; }' . "\n";
            $html .= '        .summary-item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #bfdbfe; }' . "\n";
            $html .= '        .summary-item:last-child { border: none; }' . "\n";
            $html .= '        .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 9px; }' . "\n";
            $html .= '    </style>' . "\n";
            $html .= '</head>' . "\n";
            $html .= '<body>' . "\n";
            $html .= '    <div class="container">' . "\n";
            $html .= '        <div class="header">' . "\n";
            $html .= '            <h1>Laporan Penjualan</h1>' . "\n";
            $html .= '            <p>' . $monthName . ' ' . $year . '</p>' . "\n";
            $html .= '            <div class="generated">Dibuat: ' . $generatedAt . '</div>' . "\n";
            $html .= '        </div>' . "\n";
            $html .= '        <div class="stats">' . "\n";
            $html .= '            <div class="stat-box">' . "\n";
            $html .= '                <div class="stat-label">Total Penjualan</div>' . "\n";
            $html .= '                <div class="stat-value">Rp ' . number_format($totalSales, 0, ',', '.') . '</div>' . "\n";
            $html .= '            </div>' . "\n";
            $html .= '            <div class="stat-box">' . "\n";
            $html .= '                <div class="stat-label">Total Pesanan</div>' . "\n";
            $html .= '                <div class="stat-value">' . $totalOrders . '</div>' . "\n";
            $html .= '            </div>' . "\n";
            $html .= '            <div class="stat-box">' . "\n";
            $html .= '                <div class="stat-label">Rata-rata Order</div>' . "\n";
            $html .= '                <div class="stat-value">Rp ' . number_format($averageOrder, 0, ',', '.') . '</div>' . "\n";
            $html .= '            </div>' . "\n";
            $html .= '        </div>' . "\n";
            $html .= '        <div class="section">' . "\n";
            $html .= '            <h2>Detail Pesanan</h2>' . "\n";
            $html .= '            <table>' . "\n";
            $html .= '                <thead>' . "\n";
            $html .= '                    <tr>' . "\n";
            $html .= '                        <th style="width: 12%;">No. Pesanan</th>' . "\n";
            $html .= '                        <th style="width: 20%;">Tanggal</th>' . "\n";
            $html .= '                        <th style="width: 25%;">Pelanggan</th>' . "\n";
            $html .= '                        <th style="width: 10%; text-align: center;">Produk</th>' . "\n";
            $html .= '                        <th style="width: 18%; text-align: right;">Total</th>' . "\n";
            $html .= '                        <th style="width: 15%;">Status</th>' . "\n";
            $html .= '                    </tr>' . "\n";
            $html .= '                </thead>' . "\n";
            $html .= '                <tbody>' . "\n";

            // Add order rows
            foreach ($orders as $order) {
                $customerName = $order->user->name ?? '-';
                $createdDate = $order->created_at->format('d/m/Y H:i');
                $totalPrice = number_format($order->total_price, 0, ',', '.');
                $itemCount = $order->items->count();
                $status = $this->getStatusLabel($order->status);

                $html .= '                    <tr>' . "\n";
                $html .= '                        <td><strong>INV-' . $order->id . '</strong></td>' . "\n";
                $html .= '                        <td>' . $createdDate . '</td>' . "\n";
                $html .= '                        <td>' . $customerName . '</td>' . "\n";
                $html .= '                        <td class="center">' . $itemCount . '</td>' . "\n";
                $html .= '                        <td class="right">Rp ' . $totalPrice . '</td>' . "\n";
                $html .= '                        <td>' . $status . '</td>' . "\n";
                $html .= '                    </tr>' . "\n";
            }

            $html .= '                </tbody>' . "\n";
            $html .= '            </table>' . "\n";
            $html .= '        </div>' . "\n";
            $html .= '        <div class="summary">' . "\n";
            $html .= '            <h3>RINGKASAN LAPORAN</h3>' . "\n";
            $html .= '            <div class="summary-item">' . "\n";
            $html .= '                <span><strong>Total Pesanan:</strong></span>' . "\n";
            $html .= '                <span>' . $totalOrders . ' pesanan</span>' . "\n";
            $html .= '            </div>' . "\n";
            $html .= '            <div class="summary-item">' . "\n";
            $html .= '                <span><strong>Total Penjualan:</strong></span>' . "\n";
            $html .= '                <span>Rp ' . number_format($totalSales, 0, ',', '.') . '</span>' . "\n";
            $html .= '            </div>' . "\n";
            $html .= '            <div class="summary-item">' . "\n";
            $html .= '                <span><strong>Rata-rata Per Pesanan:</strong></span>' . "\n";
            $html .= '                <span>Rp ' . number_format($averageOrder, 0, ',', '.') . '</span>' . "\n";
            $html .= '            </div>' . "\n";
            $html .= '        </div>' . "\n";
            $html .= '        <div class="footer">' . "\n";
            $html .= '            <p>Laporan ini dibuat secara otomatis oleh sistem Toko Pancing Online</p>' . "\n";
            $html .= '            <p>Untuk pertanyaan, hubungi admin@tokoancing.com</p>' . "\n";
            $html .= '        </div>' . "\n";
            $html .= '    </div>' . "\n";
            $html .= '</body>' . "\n";
            $html .= '</html>';

            // Generate PDF
            $pdf = Pdf::loadHTML($html);
            $pdf->setPaper('a4', 'portrait');

            $filename = "Laporan-Penjualan-{$year}-{$month}-" . now()->format('Ymd-His') . ".pdf";

            return $pdf->download($filename);
        } catch (\Throwable $e) {
            \Log::error('PDF Export Error: ' . $e->getMessage() . ' | File: ' . $e->getFile() . ' | Line: ' . $e->getLine());
            return response()->json([
                'message' => 'Gagal membuat PDF',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Export sales report as CSV
     */
    public function exportSalesCSV(Request $request)
    {
        try {
            // Get period from query
            $month = $request->query('month', date('m'));
            $year = $request->query('year', date('Y'));

            // Calculate date range
            $startDate = Carbon::createFromFormat('Y-m-d', "{$year}-{$month}-01")->startOfDay();
            $endDate = $startDate->copy()->endOfMonth();

            // Get sales data
            $orders = Order::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', '!=', 'cancelled')
                ->with('user', 'items.product')
                ->orderBy('created_at', 'desc')
                ->get();

            // Create CSV content
            $csv = "No.,ID Pesanan,Tanggal,Pelanggan,Jumlah Produk,Total,Status\n";

            $counter = 1;
            foreach ($orders as $order) {
                $customerName = $order->user->name ?? '-';
                $customerName = str_replace('"', '""', $customerName);
                $createdDate = $order->created_at->format('d/m/Y H:i');
                $totalPrice = $order->total_price;
                $itemCount = $order->items->count();
                $status = $this->getStatusLabel($order->status);

                $csv .= $counter . ',' . $order->id . ',"' . $createdDate . '","' . $customerName . '",' . $itemCount . ',' . $totalPrice . ',"' . $status . '"' . "\n";
                $counter++;
            }

            // Create response
            $filename = "Laporan-Penjualan-{$year}-{$month}-" . now()->format('Ymd-His') . ".csv";

            return response($csv, 200)
                ->header('Content-Type', 'text/csv; charset=utf-8')
                ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
        } catch (\Throwable $e) {
            \Log::error('CSV Export Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal membuat CSV',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get month name in Indonesian
     */
    private function getMonthName($month)
    {
        $months = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];

        return $months[(int) $month] ?? 'Januari';
    }

    /**
     * Get status label in Indonesian
     */
    private function getStatusLabel($status)
    {
        $labels = [
            'pending' => 'Menunggu',
            'processing' => 'Diproses',
            'shipped' => 'Dikirim',
            'delivered' => 'Terima',
            'cancelled' => 'Dibatalkan',
        ];

        return $labels[$status] ?? ucfirst($status);
    }
}

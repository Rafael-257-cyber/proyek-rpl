<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            color: #333;
            font-size: 11px;
            line-height: 1.5;
        }

        .container {
            width: 100%;
            margin: 0 auto;
            padding: 20px;
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 15px;
        }

        .header h1 {
            font-size: 24px;
            color: #1e40af;
            margin-bottom: 5px;
        }

        .header p {
            color: #666;
            font-size: 12px;
        }

        .header .generated-info {
            text-align: right;
            font-size: 10px;
            color: #999;
            margin-top: 10px;
        }

        /* Statistics */
        .stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 15px;
        }

        .stat-box {
            flex: 1;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-left: 4px solid #1e40af;
            padding: 15px;
            border-radius: 4px;
        }

        .stat-box .label {
            color: #666;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 5px;
        }

        .stat-box .value {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
        }

        /* Data Table */
        .data-section {
            margin-bottom: 30px;
        }

        .data-section h2 {
            font-size: 14px;
            color: #1e40af;
            margin-bottom: 15px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 8px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        table thead {
            background-color: #1e40af;
            color: white;
        }

        table th {
            padding: 10px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
        }

        table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 10px;
        }

        table tbody tr:nth-child(even) {
            background-color: #f9fafb;
        }

        table tbody tr:hover {
            background-color: #f3f4f6;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .text-bold {
            font-weight: bold;
        }

        .currency {
            text-align: right;
            font-family: monospace;
        }

        /* Summary */
        .summary {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
        }

        .summary h3 {
            color: #1e40af;
            font-size: 12px;
            margin-bottom: 10px;
        }

        .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            font-size: 11px;
        }

        .summary-item .label {
            font-weight: bold;
        }

        .summary-item .value {
            text-align: right;
        }

        /* Footer */
        .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #999;
            font-size: 9px;
        }

        /* Page Break */
        .page-break {
            page-break-after: always;
        }

        /* Print optimized */
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            .container {
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>{{ $title }}</h1>
            <p>{{ $period }}</p>
            <div class="generated-info">
                Dibuat: {{ $generatedAt }}
            </div>
        </div>

        <!-- Statistics -->
        <div class="stats">
            <div class="stat-box">
                <div class="label">Total Penjualan</div>
                <div class="value">Rp {{ number_format($totalSales, 0, ',', '.') }}</div>
            </div>
            <div class="stat-box">
                <div class="label">Total Pesanan</div>
                <div class="value">{{ $totalOrders }}</div>
            </div>
            <div class="stat-box">
                <div class="label">Rata-rata Order</div>
                <div class="value">Rp {{ number_format($averageOrder, 0, ',', '.') }}</div>
            </div>
        </div>

        <!-- Daily Sales Section -->
        <div class="data-section">
            <h2>Penjualan Harian</h2>
            @if($dailySales->count() > 0)
                <table>
                    <thead>
                        <tr>
                            <th style="width: 30%;">Tanggal</th>
                            <th style="width: 30%; text-align: center;">Jumlah Order</th>
                            <th style="width: 40%; text-align: right;">Total Penjualan</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($dailySales as $day)
                            <tr>
                                <td>{{ $day['date'] }}</td>
                                <td class="text-center">{{ $day['count'] }} order</td>
                                <td class="currency">Rp {{ number_format($day['total'], 0, ',', '.') }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <p style="text-align: center; color: #999;">Tidak ada data penjualan untuk periode ini</p>
            @endif
        </div>

        <!-- Orders Detail Section -->
        <div class="data-section">
            <h2>Detail Pesanan</h2>
            @if($orders->count() > 0)
                <table>
                    <thead>
                        <tr>
                            <th style="width: 12%;">No. Pesanan</th>
                            <th style="width: 20%;">Tanggal</th>
                            <th style="width: 25%;">Pelanggan</th>
                            <th style="width: 10%; text-align: center;">Produk</th>
                            <th style="width: 18%; text-align: right;">Total Harga</th>
                            <th style="width: 15%;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($orders as $order)
                            <tr>
                                <td class="text-bold">INV-{{ $order->id }}</td>
                                <td>{{ $order->created_at->format('d/m/Y H:i') }}</td>
                                <td>{{ $order->user->name ?? '-' }}</td>
                                <td class="text-center">{{ $order->items->count() }}</td>
                                <td class="currency">Rp {{ number_format($order->total_price, 0, ',', '.') }}</td>
                                <td>
                                    @php
                                        $statusMap = [
                                            'pending' => 'Menunggu Pembayaran',
                                            'confirmed' => 'Dikonfirmasi',
                                            'processing' => 'Diproses',
                                            'shipped' => 'Dikirim',
                                            'delivered' => 'Selesai',
                                            'cancelled' => 'Dibatalkan',
                                        ];
                                    @endphp
                                    {{ $statusMap[$order->status] ?? ucfirst($order->status) }}
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <p style="text-align: center; color: #999;">Tidak ada pesanan untuk periode ini</p>
            @endif
        </div>

        <!-- Summary -->
        <div class="summary">
            <h3>RINGKASAN LAPORAN</h3>
            <div class="summary-item">
                <span class="label">Total Pesanan:</span>
                <span class="value">{{ $totalOrders }} pesanan</span>
            </div>
            <div class="summary-item">
                <span class="label">Total Penjualan:</span>
                <span class="value">Rp {{ number_format($totalSales, 0, ',', '.') }}</span>
            </div>
            <div class="summary-item">
                <span class="label">Rata-rata Per Pesanan:</span>
                <span class="value">Rp {{ number_format($averageOrder, 0, ',', '.') }}</span>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Laporan ini dibuat secara otomatis oleh sistem Toko Pancing Online</p>
            <p>Untuk pertanyaan, hubungi admin@tokoancing.com</p>
        </div>
    </div>
</body>
</html>

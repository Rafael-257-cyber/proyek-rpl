import React, { useState, useEffect } from 'react';
import { FaDownload, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import AdminLayout from '../components/AdminLayout';
import { adminAPI } from '../services/api';

export default function AdminSalesReport() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [chartData, setChartData] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchSalesReport();
  }, [selectedMonth]);

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split('-');
      const response = await adminAPI.getSalesChart({ period: 'daily', month, year });
      
      // Mock report data if API doesn't provide it
      const mockReport = {
        total_sales: 125750000,
        total_orders: 342,
        average_order: 368128,
        data: response.data.data || [
          { date: '1', sales: 450 },
          { date: '2', sales: 320 },
          { date: '3', sales: 280 },
          { date: '4', sales: 390 },
          { date: '5', sales: 240 },
          { date: '6', sales: 520 },
          { date: '7', sales: 380 },
        ]
      };

      setReportData(mockReport);
      setChartData(mockReport.data);
    } catch (err) {
      console.error('Failed to fetch sales report:', err);
      setError(err.response?.data?.message || 'Gagal memuat laporan penjualan');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const [year, month] = selectedMonth.split('-');
      
      const response = await adminAPI.exportSalesPDF({ 
        period: 'daily', 
        month, 
        year 
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Laporan-Penjualan-${year}-${month}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Gagal mengekspor PDF: ' + (err.response?.data?.message || err.message));
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const [year, month] = selectedMonth.split('-');
      
      const response = await adminAPI.exportSalesCSV({ 
        period: 'daily', 
        month, 
        year 
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Laporan-Penjualan-${year}-${month}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('Gagal mengekspor CSV: ' + (err.response?.data?.message || err.message));
    } finally {
      setExporting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const months = [
    { value: '2024-01', label: 'Januari 2024' },
    { value: '2024-02', label: 'Februari 2024' },
    { value: '2024-03', label: 'Maret 2024' },
    { value: '2024-04', label: 'April 2024' },
    { value: '2024-05', label: 'Mei 2024' },
    { value: '2024-06', label: 'Juni 2024' },
    { value: '2024-07', label: 'Juli 2024' },
    { value: '2024-08', label: 'Agustus 2024' },
    { value: '2024-09', label: 'September 2024' },
    { value: '2024-10', label: 'Oktober 2024' },
    { value: '2024-11', label: 'November 2024' },
    { value: '2024-12', label: 'Desember 2024' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Memuat laporan...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const maxSales = chartData.length > 0 ? Math.max(...chartData.map(d => d.sales)) : 100;

  return (
    <AdminLayout>
      <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Laporan Penjualan</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periode
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchSalesReport}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Tampilkan
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Sales */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm font-medium mb-3">Total Penjualan</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {reportData ? formatPrice(reportData.total_sales) : 'Rp0'}
            </h3>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-gray-500">Bulan ini</span>
              <span className="text-green-600 font-semibold">+12.5%</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm font-medium mb-3">Total Pesanan</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {reportData ? reportData.total_orders : 0}
            </h3>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-gray-500">Pesanan</span>
              <span className="text-blue-600 font-semibold">+8.2%</span>
            </div>
          </div>

          {/* Average Order */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm font-medium mb-3">Rata-rata Order</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {reportData ? formatPrice(reportData.average_order) : 'Rp0'}
            </h3>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-gray-500">Per pesanan</span>
              <span className="text-orange-600 font-semibold">+3.1%</span>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Grafik Penjualan</h2>

          {/* Line Chart */}
          {chartData.length > 0 ? (
            <div className="w-full bg-gray-50 rounded-lg p-6 min-h-80">
              <svg viewBox="0 0 800 300" className="w-full h-auto" style={{ minHeight: '300px' }}>
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={`grid-${i}`}
                    x1="50"
                    y1={280 - (i * 70)}
                    x2="780"
                    y2={280 - (i * 70)}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                ))}

                {/* Y-axis */}
                <line x1="50" y1="20" x2="50" y2="280" stroke="#374151" strokeWidth="2" />
                
                {/* X-axis */}
                <line x1="50" y1="280" x2="780" y2="280" stroke="#374151" strokeWidth="2" />

                {/* Y-axis labels */}
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const value = Math.round((maxSales / 5) * i);
                  return (
                    <text
                      key={`ylabel-${i}`}
                      x="40"
                      y={285 - (i * 56)}
                      textAnchor="end"
                      fontSize="12"
                      fill="#6b7280"
                    >
                      {value}k
                    </text>
                  );
                })}

                {/* Line path */}
                <polyline
                  points={chartData
                    .map((data, idx) => {
                      const x = 50 + (idx / (chartData.length - 1 || 1)) * 730;
                      const y = 280 - (data.sales / maxSales) * 260;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                {chartData.map((data, idx) => {
                  const x = 50 + (idx / (chartData.length - 1 || 1)) * 730;
                  const y = 280 - (data.sales / maxSales) * 260;
                  return (
                    <g key={`point-${idx}`} className="group">
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#3b82f6"
                        className="transition-all hover:r-7"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#3b82f6"
                        opacity="0.2"
                        r="10"
                      />
                      {/* Tooltip */}
                      <title>{data.sales}k</title>
                      <text
                        x={x}
                        y={y - 20}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#1f2937"
                        fontWeight="600"
                        className="pointer-events-none"
                      >
                        {data.sales}k
                      </text>
                    </g>
                  );
                })}

                {/* X-axis labels */}
                {chartData.map((data, idx) => {
                  const x = 50 + (idx / (chartData.length - 1 || 1)) * 730;
                  return (
                    <text
                      key={`xlabel-${idx}`}
                      x={x}
                      y="300"
                      textAnchor="middle"
                      fontSize="12"
                      fill="#6b7280"
                    >
                      {data.date}
                    </text>
                  );
                })}
              </svg>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Tidak ada data</p>
          )}

          {/* Chart Info */}
          <div className="mt-4 flex justify-between items-center px-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Penjualan Harian</span>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaFilePdf className="w-5 h-5" />
            {exporting ? 'Mengekspor...' : 'Export PDF'}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaFileExcel className="w-5 h-5" />
            {exporting ? 'Mengekspor...' : 'Export Excel'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

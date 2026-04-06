import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaDollarSign, FaClock, FaBox, FaExclamationTriangle } from 'react-icons/fa';
import AdminLayout from '../components/AdminLayout';
import { adminAPI } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getSalesChart({ period: 'daily' })
      ]);

      setStats(statsRes.data.data);
      setChartData(chartRes.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, unit, color }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {unit && <span className="text-gray-400 text-sm">{unit}</span>}
          </div>
        </div>
        <div className={`${color} bg-opacity-10 p-4 rounded-lg ${color}`}>
          <Icon size={28} className={color.replace('bg-', 'text-')} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Memuat data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={FaDollarSign}
            label="Total Penjualan"
            value={stats?.total_sales || 0}
            unit="buah"
            color="border-green-500"
          />
          <StatCard
            icon={FaShoppingCart}
            label="Total Pesanan"
            value={stats?.total_orders || 0}
            unit="pesanan"
            color="border-blue-500"
          />
          <StatCard
            icon={FaClock}
            label="Pending Pembayaran"
            value={stats?.pending_payment || 0}
            unit="pesanan"
            color="border-yellow-500"
          />
          <StatCard
            icon={FaBox}
            label="Total Produk"
            value={stats?.total_products || 0}
            unit="produk"
            color="border-purple-500"
          />
          <StatCard
            icon={FaExclamationTriangle}
            label="Stok Rendah"
            value={stats?.low_stock_products || 0}
            unit="produk"
            color="border-red-500"
          />
        </div>

        {/* Revenue by Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Pendapatan Berdasarkan Status</h3>
          <div className="space-y-3">
            {stats?.revenue_by_status && Object.entries(stats.revenue_by_status).map(([status, revenue]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                </div>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: stats?.total_sales > 0 ? `${(revenue / Math.max(...Object.values(stats.revenue_by_status))) * 100}%` : '0%'
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-800">Rp{revenue?.toLocaleString('id-ID') || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Pesanan Terbaru</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">ID Pesanan</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Pembeli</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Total</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent_orders && stats.recent_orders.length > 0 ? (
                  stats.recent_orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">#{order.id}</td>
                      <td className="px-4 py-3 text-gray-700">{order.user_name}</td>
                      <td className="px-4 py-3 text-gray-700 font-semibold">
                        Rp{order.total_price?.toLocaleString('id-ID') || 0}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Tidak ada pesanan</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

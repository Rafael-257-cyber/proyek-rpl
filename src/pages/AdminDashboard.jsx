import React, { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import { FaDollarSign, FaShoppingCart, FaBox, FaUsers } from 'react-icons/fa';
import AdminLayout from '../components/AdminLayout';
import { adminAPI } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await adminAPI.getDashboardStats();
      setStats(statsRes.data.stats);
      
      // Mock recent orders - replace with actual API call
      setRecentOrders([
        { id: '0023M', customer: 'John Doe', total: 1455000, status: 'pending', date: '2024-06-12' },
        { id: '0233', customer: 'Budi Santoso', total: 1100500, status: 'processing', date: '2024-06-12' },
        { id: '0233', customer: 'Ahmad Oki', total: 320000, status: 'processing', date: '2024-06-11' },
      ]);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, change, color }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <div className="flex items-center gap-1 mt-3">
            <FiArrowUp className={`w-4 h-4 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AdminLayout>
      <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FaDollarSign}
            label="Total Penjualan"
            value={formatPrice(stats?.total_sales || 0)}
            change={2.5}
            color="bg-blue-500"
          />
          <StatCard
            icon={FaShoppingCart}
            label="Total Pesanan"
            value={stats?.total_orders || 0}
            change={8.2}
            color="bg-green-500"
          />
          <StatCard
            icon={FaBox}
            label="Total Produk"
            value={stats?.total_products || 0}
            change={3.1}
            color="bg-purple-500"
          />
          <StatCard
            icon={FaUsers}
            label="Total User"
            value={stats?.total_users || 0}
            change={15.3}
            color="bg-orange-500"
          />
        </div>

        {/* Charts & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Grafik Penjualan</h2>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Lihat Semua
              </button>
            </div>
            
            {/* Simple Bar Chart */}
            <div className="h-64 flex items-end justify-between gap-2 px-4 py-8 bg-gray-50 rounded-lg">
              {[
                { value: 45, label: 'Jan' },
                { value: 52, label: 'Feb' },
                { value: 48, label: 'Mar' },
                { value: 65, label: 'Apr' },
                { value: 58, label: 'May' },
                { value: 72, label: 'Jun' },
              ].map((data, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <div
                    className="w-full bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-colors relative"
                    style={{ height: `${(data.value / 100) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data.value}k
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{data.label}</p>
                </div>
              ))}
            </div>

            {/* Chart Tab */}
            <div className="flex gap-4 justify-center mt-6">
              <button className="text-blue-600 text-sm font-medium border-b-2 border-blue-600 pb-2">
                Lihat Semua
              </button>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Pesanan Terbaru</h2>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Lihat Semua
              </button>
            </div>

            <div className="space-y-4">
              {recentOrders.map((order, idx) => (
                <div key={idx} className="pb-4 border-b border-gray-200 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        #INV-{order.id}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {order.customer}
                      </p>
                      <p className="font-bold text-gray-900 text-sm mt-2">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

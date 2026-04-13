import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiChevronRight, FiPackage } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersAPI.getUserOrders();
        let fetchedOrders = response.data.orders || response.data.data || [];
        
        // Filter by status if not 'all'
        if (filterStatus !== 'all') {
          fetchedOrders = fetchedOrders.filter(order => order.status === filterStatus);
        }
        
        setOrders(fetchedOrders);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat pesanan');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token, navigate, filterStatus]);

  const getStatusColor = (status) => {
    const colors = {
      pending_payment: 'bg-yellow-100 text-yellow-800',
      pending_verification: 'bg-blue-100 text-blue-800',
      payment_confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending_payment: 'Menunggu Pembayaran',
      pending_verification: 'Menunggu Verifikasi',
      payment_confirmed: 'Pembayaran Dikonfirmasi',
      processing: 'Sedang Diproses',
      shipped: 'Dalam Pengiriman',
      delivered: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    return labels[status] || status;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar onCartClick={() => {}} />

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-none">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-8 text-sm">
              <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
                Beranda
              </Link>
              <FiChevronRight className="text-gray-400" />
              <span className="text-gray-600 font-medium">Pesanan Saya</span>
            </div>

            {/* Page Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Pesanan Saya</h1>

            {/* Filter Tabs */}
            <div className="mb-8 flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Semua' },
                { value: 'pending_payment', label: 'Menunggu Pembayaran' },
                { value: 'processing', label: 'Diproses' },
                { value: 'shipped', label: 'Dalam Pengiriman' },
                { value: 'delivered', label: 'Selesai' },
                { value: 'cancelled', label: 'Dibatalkan' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilterStatus(tab.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    filterStatus === tab.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-600 text-lg">Memuat pesanan...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-red-600 text-lg mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Coba Lagi
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Pesanan</h2>
                <p className="text-gray-600 mb-6">Anda belum memiliki pesanan. Mulai berbelanja sekarang!</p>
                <Link
                  to="/"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
                >
                  Mulai Berbelanja
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-blue-300"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                      {/* Order ID and Date */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Nomor Pesanan</p>
                        <p className="text-lg font-bold text-gray-900">#{order.id}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(order.created_at).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                      {/* Items Count */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Item</p>
                        <p className="text-lg font-bold text-gray-900">
                          {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'Produk' : 'Produk'}
                        </p>
                      </div>

                      {/* Total Price */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total</p>
                        <p className="text-lg font-bold text-blue-600">
                          Rp {order.total_price?.toLocaleString('id-ID') || 0}
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>

                      {/* Action */}
                      <div className="flex justify-end">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2">
                          Lihat Detail
                          <FiChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

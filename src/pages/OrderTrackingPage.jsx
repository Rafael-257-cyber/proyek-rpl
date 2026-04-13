import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiChevronRight, FiCheck, FiTruck, FiPackage, FiClock } from 'react-icons/fi';
import { FaEdit } from 'react-icons/fa';
import { ordersAPI, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RatingModal from '../components/RatingModal';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingModal, setRatingModal] = useState({ isOpen: false, item: null });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await ordersAPI.getOrder(orderId);
        setOrder(response.data.order || response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Pesanan tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token, navigate]);

  const getStatusColor = (status) => {
    const statusMap = {
      pending_payment: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
      pending_verification: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
      payment_confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
      processing: { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
      shipped: { bg: 'bg-indigo-50', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-800' },
      delivered: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
      cancelled: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
    };
    return statusMap[status] || statusMap.pending_payment;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending_payment: 'Menunggu Pembayaran',
      pending_verification: 'Menunggu Verifikasi',
      payment_confirmed: 'Dikonfirmasi',
      processing: 'Diproses',
      shipped: 'Dikirim',
      delivered: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    return labels[status] || status;
  };

  const getStatusTimeline = () => {
    const defaultStart = [{ label: 'Pesanan Dibuat', status: 'done', time: order?.created_at }];
    const payment = [...defaultStart, { label: 'Pembayaran Dikonfirmasi', status: 'done', time: order?.updated_at }];
    const processed = [...payment, { label: 'Sedang Diproses', status: 'done', time: order?.updated_at }];
    const shipping = [...processed, { label: 'Dikirim', status: 'done', time: order?.shipped_at }];
    
    const timelines = {
      pending_payment: defaultStart,
      pending_verification: defaultStart,
      payment_confirmed: payment,
      processing: processed,
      shipped: shipping,
      delivered: [...shipping, { label: 'Tiba', status: 'done', time: order?.delivered_at }],
      cancelled: [...defaultStart, { label: 'Dibatalkan', status: 'done', time: order?.updated_at }],
    };
    return timelines[order?.status] || defaultStart;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-12 text-center">
            <p className="text-gray-600">Memuat pesanan...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-12 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link to="/orders" className="text-blue-600 hover:text-blue-700 font-medium">
              Kembali ke Pesanan Saya
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusColor = getStatusColor(order.status);
  const timeline = getStatusTimeline();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm text-gray-600">
            <Link to="/orders" className="text-blue-600 hover:text-blue-700">Pesanan Saya</Link>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-gray-800 font-medium">#{order.id}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2">
              {/* Order Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">#INV-{order.id}</h2>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColor.badge}`}>
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                {/* Products */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    {order.items && order.items.length > 0 ? (
                      <>
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="w-16 h-16 object-cover rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {item.product && item.product.image ? (
                              <img
                                  src={getImageUrl(item.product.image)}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FiPackage className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="text-sm text-gray-600 font-medium ml-2">
                            +{order.items.length - 3} lainnya
                          </div>
                        )}
                      </>
                    ) : (
                      <FiPackage className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {order.items?.length || 0} Produk
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(order.total_amount || order.total || 0)}
                  </p>
                </div>

                {/* Shipping Info */}
                {order.status !== 'pending' && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Informasi Pengiriman</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium text-gray-800">Kurir: </span>
                        {order.shipping_method || 'JNE Express'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">No. Resi: </span>
                        {order.tracking_number || 'JNE-1234567890'}
                      </div>
                    </div>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700 mt-3">
                      Lihat Detail →
                    </button>
                  </div>
                )}
              </div>

              {/* Items Detail Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Detail Produk</h3>
                <div className="space-y-4">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                        <img
                            src={getImageUrl(item.product?.image) || '/images/reel-pancing.jpg'}
                          alt={item.product?.name}
                          className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.product?.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.quantity}x {formatPrice(item.price)}
                          </p>
                          <p className="text-sm font-bold text-gray-800 mt-2">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          {order.status === 'delivered' && (
                            <button
                              onClick={() => setRatingModal({ isOpen: true, item })}
                              className="flex items-center gap-2 mt-3 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                            >
                              <FaEdit size={14} />
                              Beri Rating
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Tidak ada produk</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Timeline */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Status Pesanan</h3>

                {/* Timeline */}
                <div className="space-y-4">
                  {timeline.length > 0 ? (
                    timeline.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        {/* Timeline Circle */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500 text-white flex-shrink-0">
                            <FiCheck className="w-5 h-5" />
                          </div>
                          {idx < timeline.length - 1 && (
                            <div className="w-0.5 h-12 bg-green-500 my-2"></div>
                          )}
                        </div>

                        {/* Timeline Content */}
                        <div className="pb-4">
                          <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.time ? formatDate(item.time) : 'Dalam proses'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Belum ada update status</p>
                  )}
                </div>

                {/* Delivery Estimate */}
                {order.estimated_delivery && (
                  <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium">Estimasi Tiba</p>
                    <p className="text-sm font-semibold text-blue-700 mt-1">
                      {formatDate(order.estimated_delivery)}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h3 className="font-bold text-gray-800 mb-4">Ringkasan Pesanan</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ongkir</span>
                    <span>{formatPrice(order.shipping_cost || 0)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(order.total_amount || order.total || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, item: null })}
        orderItem={ratingModal.item}
        onSuccess={() => {
          // Refresh order data after successful rating
          setOrder(prev => prev); // Simple refresh to show updates
        }}
      />
    </div>
  );
}

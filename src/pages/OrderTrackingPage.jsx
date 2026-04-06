import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await ordersAPI.getOrder(orderId);
        setOrder(response.data.order);
      } catch (err) {
        setError(err.response?.data?.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user, navigate]);

  const handleUploadPaymentProof = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await ordersAPI.uploadPaymentProof(orderId, file);
      setOrder(response.data.order);
      setPaymentProof(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload payment proof');
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading order...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Order not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lacak Pesanan</h1>
        <p className="text-gray-600 mb-8">Order #{order.id}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Status Pesanan</h2>
              <div className={`inline-block px-4 py-2 rounded-full font-medium ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </div>

              {/* Timeline */}
              <div className="mt-6 space-y-4">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    order.status !== 'pending_payment' ? 'bg-green-500' : 'bg-gray-300'
                  } text-white`}>
                    ✓
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Pesanan Dibuat</p>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    ['payment_confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  } text-white`}>
                    ✓
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Pembayaran Dikonfirmasi</p>
                    <p className="text-sm text-gray-500">
                      {order.payment_confirmed ? new Date(order.payment_confirmed).toLocaleDateString('id-ID') : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    ['processing', 'shipped', 'delivered'].includes(order.status)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  } text-white`}>
                    ✓
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Sedang Diproses</p>
                    <p className="text-sm text-gray-500">-</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    ['shipped', 'delivered'].includes(order.status)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  } text-white`}>
                    ✓
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Dalam Pengiriman</p>
                    <p className="text-sm text-gray-500">
                      {order.tracking_number ? `Resi: ${order.tracking_number}` : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'
                  } text-white`}>
                    ✓
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Selesai</p>
                    <p className="text-sm text-gray-500">
                      {order.delivered_at ? new Date(order.delivered_at).toLocaleDateString('id-ID') : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Item Pesanan</h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <p className="font-medium text-gray-900">{item.product?.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Proof Upload */}
            {order.status === 'pending_payment' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Upload Bukti Pembayaran</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadPaymentProof}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Upload foto struk transfer ke No Rekening yang sudah diberikan
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Pesanan</h3>

              <div className="space-y-3 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-500">No. Pesanan</p>
                  <p className="font-medium text-gray-900">#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal</p>
                  <p className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Metode Pembayaran</p>
                  <p className="font-medium text-gray-900">
                    {order.payment_method === 'transfer' ? 'Transfer Bank' : 'Bayar di Tempat'}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 pb-4 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rp {order.total_price.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-blue-600">Rp {order.total_price.toLocaleString('id-ID')}</span>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Alamat Pengiriman</h4>
                <p className="text-sm text-gray-600">{order.shipping_address}</p>
                <p className="text-sm text-gray-600">{order.shipping_city}</p>
                <p className="text-sm text-gray-600">{order.shipping_phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

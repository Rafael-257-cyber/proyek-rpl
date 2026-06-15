import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiChevronRight, FiCheck, FiTruck, FiPackage, FiClock, FiUpload } from 'react-icons/fi';
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
  const [pageError, setPageError] = useState('');
  const [proofError, setProofError] = useState('');
  const [ratingModal, setRatingModal] = useState({ isOpen: false, item: null });
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const pollingTimerRef = useRef(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if not authenticated
  const loadOrder = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const response = await ordersAPI.getOrder(orderId);
      const fetchedOrder = response.data.order || response.data;
      setOrder(fetchedOrder);
      setProofUploaded(Boolean(fetchedOrder.bukti_bayar));
      setPageError('');

      if (['delivered', 'cancelled'].includes(fetchedOrder.status) && pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    } catch (err) {
      setPageError(err.response?.data?.message || 'Pesanan tidak ditemukan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    loadOrder();
    pollingTimerRef.current = setInterval(() => {
      loadOrder({ silent: true });
    }, 15000);

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
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

  const subtotal = order?.items?.reduce((total, item) => total + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0) || 0;
  const shippingCost = Number(order?.ongkir || 0);
  const grandTotal = Number(order?.total_price || subtotal + shippingCost);
  const canUploadProof = order && ['pending_payment', 'pending_verification'].includes(order.status);
  const proofUploadLocked = proofUploaded || Boolean(order?.bukti_bayar);

  const getUploadErrorMessage = (err) => {
    const data = err.response?.data;
    if (data?.message) return data.message;

    if (data?.errors) {
      const firstError = Object.values(data.errors).flat().find(Boolean);
      if (firstError) return firstError;
    }

    if (err.response?.status === 413) {
      return 'Ukuran file terlalu besar. Gunakan gambar yang lebih kecil.';
    }

    return 'Gagal mengunggah bukti pembayaran';
  };

  const handleUploadProof = async () => {
    if (proofUploadLocked) {
      return;
    }

    if (!paymentProofFile) {
      setProofError('Pilih file bukti pembayaran terlebih dahulu');
      return;
    }

    try {
      setUploadingProof(true);
      setProofError('');
      const response = await ordersAPI.uploadPaymentProof(order.id, paymentProofFile);
      setPaymentProofFile(null);
      setProofUploaded(true);
      setSuccessMessage(response.data?.message || 'Bukti pembayaran berhasil dikirimkan');
      await loadOrder({ silent: true });
    } catch (err) {
      setProofError(getUploadErrorMessage(err));
    } finally {
      setUploadingProof(false);
    }
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

  if (pageError || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-12 text-center">
            <p className="text-red-600 mb-4">{pageError}</p>
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

                {refreshing && (
                  <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
                    <FiClock className="w-4 h-4" />
                    Memeriksa pembaruan status...
                  </div>
                )}

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
                    {formatPrice(grandTotal)}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                  <div>
                    <p className="text-gray-500">Metode Pembayaran</p>
                    <p className="font-medium text-gray-800">{order.payment_method || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Batas Pembayaran</p>
                    <p className="font-medium text-gray-800">{formatDate(order.payment_due_at)}</p>
                  </div>
                  {order.shipping_courier && (
                    <div>
                      <p className="text-gray-500">Ekspedisi</p>
                      <p className="font-medium text-gray-800">
                        {order.shipping_courier}
                        {order.shipping_service && ` – ${order.shipping_service}`}
                      </p>
                    </div>
                  )}
                  {order.shipping_estimate && (
                    <div>
                      <p className="text-gray-500">Estimasi Tiba</p>
                      <p className="font-medium text-gray-800">{order.shipping_estimate}</p>
                    </div>
                  )}
                </div>

                {canUploadProof && order.payment_method !== 'cod' && (
                  <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Unggah Bukti Pembayaran</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      Unggah foto bukti transfer agar pesanan dapat diverifikasi lebih cepat.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        disabled={proofUploadLocked}
                        onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-600 disabled:cursor-not-allowed disabled:opacity-60 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
                      />
                      <button
                        type="button"
                        onClick={handleUploadProof}
                        disabled={uploadingProof || proofUploadLocked}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        <FiUpload className="w-4 h-4" />
                        {proofUploadLocked ? 'Bukti Terkirim' : uploadingProof ? 'Mengunggah...' : 'Upload Bukti'}
                      </button>
                    </div>
                    {!proofUploadLocked && paymentProofFile && (
                      <p className="mt-2 text-xs text-blue-700">File dipilih: {paymentProofFile.name}</p>
                    )}
                    {proofError && (
                      <p className="mt-2 text-xs font-medium text-red-700">{proofError}</p>
                    )}
                    {proofUploadLocked && (
                      <p className="mt-2 text-xs font-medium text-green-700">
                        Bukti pembayaran sudah dikirim dan tombol upload dinonaktifkan.
                      </p>
                    )}
                  </div>
                )}

                {order.bukti_bayar && (
                  <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900 mb-1">Bukti Pembayaran Terkirim</p>
                    <p>File: {order.bukti_bayar.split('/').pop()}</p>
                  </div>
                )}

                {/* Shipping Info */}
                {['processing', 'shipped', 'delivered'].includes(order.status) && (
                  <div className="pt-2 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FiTruck className="w-5 h-5 text-blue-600" />
                      Informasi Pengiriman
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ekspedisi</span>
                        <span className="font-semibold text-gray-800">
                          {order.shipping_courier
                            ? `${order.shipping_courier}${order.shipping_service ? ' – ' + order.shipping_service : ''}`
                            : '-'}
                        </span>
                      </div>
                      {order.shipping_estimate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Estimasi</span>
                          <span className="font-medium text-gray-800">{order.shipping_estimate}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">No. Resi</span>
                        <span className="font-medium text-gray-800">
                          {order.tracking_number || 'Belum tersedia'}
                        </span>
                      </div>
                    </div>
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
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>
                      Ongkir
                      {order.shipping_courier && (
                        <span className="ml-1 text-xs font-medium text-blue-600">({order.shipping_courier})</span>
                      )}
                    </span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {successMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <FiCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Bukti pembayaran terkirim</h3>
            <p className="mt-2 text-sm text-gray-600">{successMessage}</p>
            <button
              type="button"
              onClick={() => setSuccessMessage('')}
              className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}

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

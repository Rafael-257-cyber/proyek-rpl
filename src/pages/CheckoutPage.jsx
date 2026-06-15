import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight, FiEdit2, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ordersAPI, getImageUrl } from '../services/api';

// ─── Shipping Couriers Data ──────────────────────────────────────────────────
const COURIERS = [
  {
    id: 'jne-reg',
    courier: 'JNE',
    service: 'Reguler (REG)',
    estimate: '2–5 hari kerja',
    cost: 15000,
    logo: '📦',
    color: '#e63329',
  },
  {
    id: 'jne-yes',
    courier: 'JNE',
    service: 'YES (Yakin Esok Sampai)',
    estimate: '1–2 hari kerja',
    cost: 28000,
    logo: '⚡',
    color: '#e63329',
  },
  {
    id: 'jnt',
    courier: 'J&T Express',
    service: 'Express',
    estimate: '1–3 hari kerja',
    cost: 18000,
    logo: '🚚',
    color: '#e31f26',
  },
  {
    id: 'sicepat-reg',
    courier: 'SiCepat',
    service: 'REG',
    estimate: '2–3 hari kerja',
    cost: 16000,
    logo: '🏃',
    color: '#f97316',
  },
  {
    id: 'sicepat-best',
    courier: 'SiCepat',
    service: 'BEST (Besok Sampai)',
    estimate: 'Hari ini/besok',
    cost: 35000,
    logo: '🔥',
    color: '#f97316',
  },
  {
    id: 'pos',
    courier: 'Pos Indonesia',
    service: 'Paket Kilat Khusus',
    estimate: '3–7 hari kerja',
    cost: 12000,
    logo: '📮',
    color: '#e11d48',
  },
  {
    id: 'anteraja',
    courier: 'AnterAja',
    service: 'Reguler',
    estimate: '2–4 hari kerja',
    cost: 14000,
    logo: '🛵',
    color: '#f59e0b',
  },
  {
    id: 'ninja',
    courier: 'Ninja Xpress',
    service: 'Standar',
    estimate: '2–4 hari kerja',
    cost: 15000,
    logo: '🥷',
    color: '#6366f1',
  },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    shipping_address: '',
    shipping_city: '',
    shipping_phone: '',
    shipping_name: '',
    payment_method: 'transfer',
  });

  const [selectedCourier, setSelectedCourier] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(true);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Auto-fill shipping name from user profile
  useEffect(() => {
    if (user && user.name && !formData.shipping_name) {
      setFormData(prev => ({
        ...prev,
        shipping_name: user.name
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      payment_method: method
    }));
  };

  const shippingCost = selectedCourier ? selectedCourier.cost : 0;
  const finalTotal = totalPrice + shippingCost;

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      setError('Keranjang masih kosong');
      window.scrollTo(0, 0);
      return;
    }

    // Validation
    if (!formData.shipping_name.trim()) {
      setError('Nama pengiriman harus diisi');
      window.scrollTo(0, 0);
      return;
    }
    if (!formData.shipping_phone.trim()) {
      setError('Nomor HP harus diisi');
      window.scrollTo(0, 0);
      return;
    }
    if (!formData.shipping_address.trim()) {
      setError('Alamat pengiriman harus diisi');
      window.scrollTo(0, 0);
      return;
    }
    if (!formData.shipping_city.trim()) {
      setError('Kota harus diisi');
      window.scrollTo(0, 0);
      return;
    }
    if (!selectedCourier) {
      setError('Pilih ekspedisi pengiriman terlebih dahulu');
      window.scrollTo(0, 0);
      return;
    }
    if (!formData.payment_method) {
      setError('Pilih metode pembayaran');
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_phone: formData.shipping_phone,
        shipping_name: formData.shipping_name,
        payment_method: formData.payment_method,
        shipping_cost: shippingCost,
        shipping_courier: selectedCourier.courier,
        shipping_service: selectedCourier.service,
        shipping_estimate: selectedCourier.estimate,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const response = await ordersAPI.checkout(orderData);

      clearCart();
      const orderId = response.data.order?.id || response.data.order_id;
      navigate(`/orders/${orderId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses pesanan');
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar onCartClick={() => {}} />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm text-gray-600">
            <span>Keranjang</span>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-blue-600 font-medium">Checkout</span>
          </div>

          {/* Step Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-2 text-sm">1</div>
                <span className="text-sm font-medium text-gray-800">Alamat</span>
              </div>
              <div className="flex-1 h-1 bg-gray-300 mx-2 mb-6"></div>
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold mb-2 text-sm">2</div>
                <span className="text-sm font-medium text-gray-500">Pembayaran</span>
              </div>
              <div className="flex-1 h-1 bg-gray-300 mx-2 mb-6"></div>
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold mb-2 text-sm">3</div>
                <span className="text-sm font-medium text-gray-500">Konfirmasi</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <span className="text-red-500 font-bold">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleCheckout}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Form */}
              <div className="lg:col-span-2 space-y-6">

                {/* ── Alamat Pengiriman ─────────────────── */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Alamat Pengiriman</h2>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(!isEditingAddress)}
                      className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      {isEditingAddress ? 'Selesai' : 'Ubah'}
                    </button>
                  </div>

                  {!isEditingAddress ? (
                    <div className="bg-blue-50 border-2 border-blue-600 rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-600 mt-1 flex-shrink-0"></div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1">{formData.shipping_name}</h3>
                          <p className="text-sm text-gray-600">{formData.shipping_phone}</p>
                          <p className="text-sm text-gray-600">{formData.shipping_address}</p>
                          <p className="text-sm text-gray-600">{formData.shipping_city}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Penerima</label>
                        <input
                          type="text"
                          name="shipping_name"
                          value={formData.shipping_name}
                          onChange={handleInputChange}
                          placeholder="Masukkan nama penerima"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nomor HP</label>
                        <input
                          type="tel"
                          name="shipping_phone"
                          value={formData.shipping_phone}
                          onChange={handleInputChange}
                          placeholder="Contoh: 081234567890"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
                        <textarea
                          name="shipping_address"
                          value={formData.shipping_address}
                          onChange={handleInputChange}
                          placeholder="Jl. Contoh No. 123, Jakarta Selatan"
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kota</label>
                        <input
                          type="text"
                          name="shipping_city"
                          value={formData.shipping_city}
                          onChange={handleInputChange}
                          placeholder="Jakarta Selatan"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Pilih Ekspedisi ───────────────────── */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <FiTruck className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-800">Pilih Ekspedisi</h2>
                  </div>

                  <div className="space-y-3">
                    {COURIERS.map((courier) => {
                      const isSelected = selectedCourier?.id === courier.id;
                      return (
                        <div
                          key={courier.id}
                          className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200"
                          style={{
                            borderColor: isSelected ? '#2563eb' : '#e5e7eb',
                            backgroundColor: isSelected ? '#eff6ff' : 'white',
                          }}
                          onClick={() => setSelectedCourier(courier)}
                        >
                          {/* Radio */}
                          <div
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                            style={{
                              borderColor: isSelected ? '#2563eb' : '#d1d5db',
                              backgroundColor: isSelected ? '#2563eb' : 'white',
                            }}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>

                          {/* Logo/Emoji */}
                          <span className="text-2xl flex-shrink-0">{courier.logo}</span>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-800">{courier.courier}</span>
                              <span className="text-sm text-gray-500">·</span>
                              <span className="text-sm text-gray-600">{courier.service}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-gray-400">Estimasi:</span>
                              <span className="text-xs font-medium text-gray-600">{courier.estimate}</span>
                            </div>
                          </div>

                          {/* Cost */}
                          <div className="text-right flex-shrink-0">
                            <span
                              className="font-bold text-base"
                              style={{ color: isSelected ? '#2563eb' : '#374151' }}
                            >
                              {formatPrice(courier.cost)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedCourier && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                      <FiCheckCircle className="text-green-600 w-5 h-5 flex-shrink-0" />
                      <span className="text-sm text-green-700">
                        Ekspedisi dipilih: <strong>{selectedCourier.courier} – {selectedCourier.service}</strong>
                        {' '}({selectedCourier.estimate})
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Metode Pembayaran ─────────────────── */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Metode Pembayaran</h2>

                  <div className="space-y-3">
                    {[
                      { value: 'transfer', label: 'Transfer Bank', icon: '🏦', desc: 'BCA, BRI, BNI, Mandiri' },
                      { value: 'ewallet', label: 'E-Wallet', icon: '📱', desc: 'OVO, DANA, GoPay' },
                      { value: 'cod', label: 'COD (Bayar di Tempat)', icon: '💵', desc: 'Bayar saat barang tiba' },
                    ].map(({ value, label, icon, desc }) => (
                      <div
                        key={value}
                        className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200"
                        style={{
                          borderColor: formData.payment_method === value ? '#2563eb' : '#e5e7eb',
                          backgroundColor: formData.payment_method === value ? '#eff6ff' : 'white',
                        }}
                        onClick={() => handlePaymentMethodChange(value)}
                      >
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                          style={{
                            borderColor: formData.payment_method === value ? '#2563eb' : '#d1d5db',
                            backgroundColor: formData.payment_method === value ? '#2563eb' : 'white',
                          }}
                        >
                          {formData.payment_method === value && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="text-2xl">{icon}</span>
                        <div>
                          <p className="font-semibold text-gray-800">{label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* ── Right Column — Order Summary ─────────── */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Ringkasan Pesanan</h2>

                  {/* Items */}
                  <div className="max-h-60 overflow-y-auto mb-6 pb-4 border-b border-gray-100 space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.quantity}x {formatPrice(item.price)}</p>
                          <p className="text-sm font-semibold text-gray-800 mt-1">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal ({cartItems.length} Produk)</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        Ongkir
                        {selectedCourier && (
                          <span className="ml-1 text-xs text-blue-600 font-medium">
                            ({selectedCourier.courier})
                          </span>
                        )}
                      </span>
                      <span className={selectedCourier ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                        {selectedCourier ? formatPrice(shippingCost) : '— Pilih ekspedisi'}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="font-bold text-gray-800">Total</span>
                      <span className="font-bold text-blue-600 text-lg">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  {/* Courier summary */}
                  {selectedCourier && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Ekspedisi</span>
                        <span className="font-medium text-gray-800">{selectedCourier.courier} – {selectedCourier.service}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimasi Tiba</span>
                        <span className="font-medium text-gray-800">{selectedCourier.estimate}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    {loading ? 'Memproses...' : 'Lanjut ke Pembayaran'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

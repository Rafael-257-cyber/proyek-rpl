import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight, FiEdit2, FiMinus, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ordersAPI, getImageUrl } from '../services/api';

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

  const [isEditingAddress, setIsEditingAddress] = useState(false);

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

  const calculateShipping = () => {
    return 15000; // Fixed shipping cost
  };

  const shippingCost = calculateShipping();
  const finalTotal = totalPrice + shippingCost;

  const handleCheckout = async (e) => {
    e.preventDefault();

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
    if (!formData.payment_method) {
      setError('Pilih metode pembayaran');
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create order
      const orderData = {
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_phone: formData.shipping_phone,
        shipping_name: formData.shipping_name,
        payment_method: formData.payment_method,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const response = await ordersAPI.checkout(orderData);
      
      // Clear cart and redirect
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
              {/* Step 1 - Alamat */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-2 text-sm">
                  1
                </div>
                <span className="text-sm font-medium text-gray-800">Alamat</span>
              </div>

              {/* Line */}
              <div className="flex-1 h-1 bg-gray-300 mx-2 mb-6"></div>

              {/* Step 2 - Pembayaran */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold mb-2 text-sm">
                  2
                </div>
                <span className="text-sm font-medium text-gray-500">Pembayaran</span>
              </div>

              {/* Line */}
              <div className="flex-1 h-1 bg-gray-300 mx-2 mb-6"></div>

              {/* Step 3 - Konfirmasi */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold mb-2 text-sm">
                  3
                </div>
                <span className="text-sm font-medium text-gray-500">Konfirmasi</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleCheckout}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Form */}
              <div className="lg:col-span-2">
                {/* Alamat Pengiriman Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
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

                  {!isEditingAddress && formData.shipping_name ? (
                    <div className="bg-blue-50 border-2 border-blue-600 rounded-2xl p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-600 mt-1"></div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-2">{formData.shipping_name}</h3>
                          <p className="text-sm text-gray-600 mb-1">{formData.shipping_phone}</p>
                          <p className="text-sm text-gray-600 mb-1">{formData.shipping_address}</p>
                          <p className="text-sm text-gray-600">{formData.shipping_city}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Penerima
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nomor HP
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alamat Lengkap
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kota
                        </label>
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

                {/* Metode Pembayaran Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Metode Pembayaran</h2>

                  <div className="space-y-3">
                    {/* Transfer Bank */}
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                      style={{
                        borderColor: formData.payment_method === 'transfer' ? '#2563eb' : '#e5e7eb',
                        backgroundColor: formData.payment_method === 'transfer' ? '#eff6ff' : 'white'
                      }}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="transfer"
                        checked={formData.payment_method === 'transfer'}
                        onChange={() => handlePaymentMethodChange('transfer')}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="ml-3 text-gray-800 font-medium">Transfer Bank</span>
                    </label>

                    {/* E-Wallet */}
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                      style={{
                        borderColor: formData.payment_method === 'ewallet' ? '#2563eb' : '#e5e7eb',
                        backgroundColor: formData.payment_method === 'ewallet' ? '#eff6ff' : 'white'
                      }}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="ewallet"
                        checked={formData.payment_method === 'ewallet'}
                        onChange={() => handlePaymentMethodChange('ewallet')}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="ml-3 text-gray-800 font-medium">E-Wallet (OVO, DANA, GoPay)</span>
                    </label>

                    {/* COD */}
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                      style={{
                        borderColor: formData.payment_method === 'cod' ? '#2563eb' : '#e5e7eb',
                        backgroundColor: formData.payment_method === 'cod' ? '#eff6ff' : 'white'
                      }}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="cod"
                        checked={formData.payment_method === 'cod'}
                        onChange={() => handlePaymentMethodChange('cod')}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="ml-3 text-gray-800 font-medium">COD (Bayar di Tempat)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Ringkasan Pesanan</h2>

                  {/* Items Summary */}
                  <div className="max-h-96 overflow-y-auto mb-6 pb-4 border-b border-gray-200">
                    {cartItems.map((item) => (
                      <div key={item.id} className="mb-4 flex gap-3">
                        <img
                            src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.quantity}x {formatPrice(item.price)}
                          </p>
                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal ({cartItems.length} Produk)</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Ongkir</span>
                      <span>{formatPrice(shippingCost)}</span>
                    </div>

                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="font-bold text-gray-800">Total</span>
                      <span className="font-bold text-blue-600 text-lg">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
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

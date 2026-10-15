import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight, FiEdit2, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ordersAPI, shippingAPI, getImageUrl } from '../services/api';

const COURIER_NAMES = {
  jne: 'JNE', anteraja: 'AnterAja', tiki: 'TIKI', spx: 'Shopee Express',
  pos: 'POS Indonesia', ide: 'ID Express', sap: 'SAP Express',
  lion: 'Lion Parcel', sicepat: 'SiCepat', jnt: 'J&T Express',
};

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
  });

  const [selectedRate, setSelectedCourier] = useState(null);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [destination, setDestination] = useState(null);
  const [searching, setSearching] = useState(false);
  const [shippingError, setShippingError] = useState('');
  const [couriers, setCouriers] = useState([]);
  const [courierCode, setCourierCode] = useState('');
  const [quote, setQuote] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [retryRates, setRetryRates] = useState(0);
  const itemsKey = JSON.stringify(cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })));
  const quoteKey = JSON.stringify([destination?.id, courierCode, itemsKey, retryRates]);
  const selectedCourier = selectedRate?.quoteKey === quoteKey ? selectedRate : null;
  const rates = quote?.key === quoteKey ? quote.rates : [];

  useEffect(() => {
    if (!token) return;
    let active = true;
    shippingAPI.couriers().then(response => {
      if (!active) return;
      setCouriers(response.data.data);
      setCourierCode(response.data.data[0] || '');
    }).catch(() => { if (active) setShippingError('Daftar kurir belum dapat dimuat. Refresh halaman untuk mencoba lagi.'); });
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    if (!token || destination || destinationQuery.trim().length < 3) {
      setDestinations([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setShippingError('');
      try {
        const response = await shippingAPI.destinations(destinationQuery.trim(), controller.signal);
        if (!controller.signal.aborted) setDestinations(response.data.data);
      } catch (err) {
        if (!controller.signal.aborted) setShippingError(err.response?.data?.message || 'Pencarian tujuan gagal. Coba lagi.');
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 400);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [destinationQuery, destination, token]);

  useEffect(() => {
    if (!token || !destination || !courierCode || !JSON.parse(itemsKey).length) {
      setRatesLoading(false);
      return;
    }
    const controller = new AbortController();
    setRatesLoading(true);
    setShippingError('');
    shippingAPI.rates({ destination_id: destination.id, courier: courierCode, items: JSON.parse(itemsKey) }, controller.signal)
      .then(response => {
        if (!controller.signal.aborted) setQuote({ key: quoteKey, ...response.data });
      }).catch(err => {
        if (!controller.signal.aborted) {
          const details = Object.values(err.response?.data?.errors || {}).flat();
          setShippingError(details.join(' ') || err.response?.data?.message || 'Tarif belum dapat dimuat.');
          setQuote(null);
        }
      }).finally(() => { if (!controller.signal.aborted) setRatesLoading(false); });
    return () => controller.abort();
  }, [destination?.id, courierCode, itemsKey, quoteKey, token]);
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
    if (!destination || ratesLoading || !selectedCourier) {
      setError('Pilih ekspedisi pengiriman terlebih dahulu');
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
        payment_method: 'transfer', // default to midtrans payment
        shipping_destination_id: destination.id,
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
      const order = response.data.order;
      const orderId = order?.id || response.data.order_id;
      const snapToken = order?.snap_token;

      // Just navigate to order tracking page. Snap popup will be opened there.
      navigate(`/orders/${orderId}`);
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.errors?.shipping_cost) { setSelectedCourier(null); setRetryRates(value => value + 1); }
      const validationErrors = Object.values(responseData?.errors || {}).flat();
      setError(validationErrors.length > 0
        ? validationErrors.join(' ')
        : responseData?.message || 'Gagal memproses pesanan');
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
                        <label htmlFor="shipping-destination" className="block text-sm font-medium text-gray-700 mb-2">Tujuan pengiriman</label>
                        <input id="shipping-destination" type="text" value={destinationQuery}
                          onChange={e => { setDestinationQuery(e.target.value); setDestination(null); setSelectedCourier(null); }}
                          placeholder="Cari kelurahan, kecamatan, kota, atau kode pos"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        {searching && <p className="text-sm text-gray-500 mt-2" role="status">Mencari tujuan...</p>}
                        {!destination && destinations.length > 0 && <ul aria-label="Hasil pencarian tujuan" className="mt-2 max-h-52 overflow-y-auto border rounded-lg divide-y">
                          {destinations.map(area => <li key={area.id}><button type="button" className="w-full text-left p-3 text-sm hover:bg-blue-50"
                            onClick={() => { setDestination(area); setDestinationQuery(area.label); setDestinations([]); setFormData(prev => ({ ...prev, shipping_city: area.city_name })); }}>
                            {area.label}
                          </button></li>)}
                        </ul>}
                        {destination && <p className="text-sm text-green-700 mt-2">Tujuan dipilih: {destination.label}</p>}
                        {!destination && !searching && destinationQuery.trim().length >= 3 && destinations.length === 0 && <p className="text-sm text-gray-500 mt-2">Pilih hasil pencarian setelah tersedia, atau coba kata kunci lain.</p>}
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
                    <label htmlFor="shipping-courier" className="block text-sm font-medium text-gray-700">Kurir</label>
                    <select id="shipping-courier" value={courierCode} onChange={e => setCourierCode(e.target.value)} className="w-full border rounded-lg p-3">
                      {couriers.map(code => <option key={code} value={code}>{COURIER_NAMES[code] || code.toUpperCase()}</option>)}
                    </select>
                    {!destination && <p className="text-sm text-gray-500">Pilih tujuan pengiriman untuk melihat tarif.</p>}
                    {ratesLoading && <p role="status" className="text-sm text-gray-500">Menghitung ongkir...</p>}
                    {shippingError && <p role="alert" className="text-sm text-red-600">{shippingError}</p>}
                    {destination && !ratesLoading && quote?.key === quoteKey && !rates.length && <p className="text-sm text-gray-500">Layanan tidak tersedia untuk tujuan ini. Pilih kurir atau tujuan lain.</p>}
                    {destination && <button type="button" disabled={ratesLoading} onClick={() => { setSelectedCourier(null); setRetryRates(value => value + 1); }} className="text-sm text-blue-700 disabled:opacity-50">Periksa ongkir ulang</button>}
                    {rates.map((rate) => {
                      const courier = { ...rate, id: `${rate.courier}:${rate.service}`, quoteKey };
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
                          <span className="text-2xl flex-shrink-0"><FiTruck /></span>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-800">{courier.name}</span>
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
                    disabled={loading || ratesLoading || !selectedCourier}
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

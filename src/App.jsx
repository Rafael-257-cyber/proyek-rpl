// src/App.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FiTruck, FiCheckCircle, FiShield, FiMessageCircle } from 'react-icons/fi';
import { GiFishingPole, GiFishingHook, GiFishingLure, GiFishingNet } from 'react-icons/gi';
import { FaSync, FaToolbox } from 'react-icons/fa';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import FilterModal from './components/FilterModal';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import MyOrdersPage from './pages/MyOrdersPage';
import WishlistPage from './pages/WishlistPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminCategories from './pages/AdminCategories';
import AdminSalesReport from './pages/AdminSalesReport';
import { productsAPI } from './services/api';
import { products } from './data/products';

function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [currentFilters, setCurrentFilters] = useState({
    search: '',
    category: '',
    location: [],
    brand: '',
    min_price: '',
    max_price: '',
    in_stock: false,
  });
  const [apiProducts, setApiProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // Will populate from API
  const [loading, setLoading] = useState(true);
  const { cartItems, addToCart, updateQuantity, removeFromCart, totalPrice, cartCount } = useCart();

  // Fetch initial products from API
  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll({});
        const fetchedProducts = response.data.data || [];
        setApiProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (err) {
        console.error('Failed to fetch initial products:', err);
        // Fallback to local data if backend fails
        setApiProducts(products);
        setFilteredProducts(products);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialProducts();
  }, []);

  const handleFilterChange = async (filters) => {
    setCurrentFilters(filters);
    setLoading(true);
    try {
      // Prepare API params
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.brand) params.brand = filters.brand;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.in_stock) params.in_stock = 'true';
      if (filters.location.length > 0) params.location = filters.location;

      const response = await productsAPI.getAll(params);
      const data = response.data.data || [];
      setFilteredProducts(data);
    } catch (err) {
      console.error('Filter error:', err);
      // fallback to initial apiProducts or local
      setFilteredProducts(apiProducts.length > 0 ? apiProducts : products);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const categories = [
    { id: 1, name: 'Joran', icon: <GiFishingPole className="w-12 h-12 mx-auto text-blue-600" />, image: 'joran.png' },
    { id: 2, name: 'Reel', icon: <FaSync className="w-12 h-12 mx-auto text-blue-600" />, image: 'reel.png' },
    { id: 3, name: 'Senar', icon: <GiFishingNet className="w-12 h-12 mx-auto text-blue-600" />, image: 'senar.png' },
    { id: 4, name: 'Umpan', icon: <GiFishingLure className="w-12 h-12 mx-auto text-blue-600" />, image: 'umpan.png' },
    { id: 5, name: 'Kail', icon: <GiFishingHook className="w-12 h-12 mx-auto text-blue-600" />, image: 'kail.png' },
    { id: 6, name: 'Aksesoris', icon: <FaToolbox className="w-12 h-12 mx-auto text-blue-600" />, image: 'aksesoris.png' },
  ];

  const features = [
    { icon: <FiTruck className="w-10 h-10 mx-auto text-blue-600 mb-3" />, title: 'Gratis Ongkir', subtitle: 'Min. transaksi Rp300.000' },
    { icon: <FiCheckCircle className="w-10 h-10 mx-auto text-green-500 mb-3" />, title: 'Produk Original', subtitle: '100% Original' },
    { icon: <FiShield className="w-10 h-10 mx-auto text-purple-500 mb-3" />, title: 'Garansi Resmi', subtitle: 'Garansi pabrik' },
    { icon: <FiMessageCircle className="w-10 h-10 mx-auto text-orange-500 mb-3" />, title: 'CS Responsif', subtitle: '24/7 Support' },
  ];

  // Bestsellers uses top 8 products from API
  const bestsellers = apiProducts && apiProducts.length > 0 ? apiProducts.slice(0, 8) : [];

  // Debug log
  useEffect(() => {
    console.log('HomePage mounted. Products count:', apiProducts?.length, 'Cart count:', cartCount);
  }, [apiProducts, cartCount]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onSearch={(query) => {
          setSearchInput(query);
          handleFilterChange({ ...currentFilters, search: query });
        }}
      />

      <main className="flex-1 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-none">
          <div className="max-w-7xl mx-auto">
            {/* Hero Banner */}
          <section className="relative h-64 md:h-72 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden rounded-2xl mt-6 mb-8">
            <div className="absolute inset-0">
              <img
                src="/assets/joran-pancing-tua-dan-air-laut-biru_34013-35.avif"
                alt="Hero"
                className="w-full h-full object-cover opacity-50"
              />
            </div>
            <div className="absolute inset-0 bg-blue-600/50"></div>
            <div className="relative h-full px-4 flex items-center">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Perlengkapan Mancing Kualitas Terbaik
                </h1>
                <p className="text-lg text-blue-100 mb-6">
                  Ternakan alat pancing terbaik dengan harga berkebalikan
                </p>
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-all shadow-lg"
                >
                  Belanja Sekarang
                </button>
              </div>
            </div>
          </section>
          {/* Features Section */}
          <section className="py-12 -mt-8 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                  {feature.icon}
                  <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.subtitle}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Kategori Populer */}
          <section className="py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Kategori Populer</h2>
              <a href="#" className="text-blue-600 font-medium hover:text-blue-700">Lihat Semua →</a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-gray-50 rounded-lg p-6 text-center hover:bg-blue-50 transition-colors cursor-pointer group"
                >
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{category.name}</h3>
                </div>
              ))}
            </div>
          </section>

          {/* Produk Terlaris */}
          <section className="py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Produk Terlaris</h2>
              <a href="#" className="text-blue-600 font-medium hover:text-blue-700">Lihat Semua →</a>
            </div>
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <ProductList products={bestsellers} onAddToCart={handleAddToCart} />
            )}
          </section>

          {/* Koleksi Alat Pancing */}
          <section className="py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Koleksi Alat Pancing</h2>
              <a href="#" className="text-blue-600 font-medium hover:text-blue-700">Lihat Semua →</a>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Cari produk pancing..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  handleFilterChange({ ...currentFilters, search: e.target.value });
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setIsFilterOpen(true)}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <ProductList products={filteredProducts} onAddToCart={handleAddToCart} />
            )}
          </section>
          </div>
        </div>
      </main>

      <Footer />

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onFilterChange={handleFilterChange}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        totalPrice={totalPrice}
      />
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

// Protected Admin Route Component
function ProtectedAdminRoute({ children }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/verify-otp" element={<OTPVerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MyOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <ProtectedRoute>
            <OrderTrackingPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedAdminRoute>
            <AdminProducts />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedAdminRoute>
            <AdminOrders />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedAdminRoute>
            <AdminCategories />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/sales-report"
        element={
          <ProtectedAdminRoute>
            <AdminSalesReport />
          </ProtectedAdminRoute>
        }
      />
    </Routes>
  );
}

export default App;
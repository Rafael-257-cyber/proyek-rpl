// src/App.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FiTruck, FiCheckCircle, FiShield, FiMessageCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { GiFishingPole, GiFishingHook, GiFishingLure, GiFishingNet } from 'react-icons/gi';
import { FaSync, FaToolbox, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import FilterModal from './components/FilterModal';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import MyOrdersPage from './pages/MyOrdersPage';
import WishlistPage from './pages/WishlistPage';
import CategoriesPage from './pages/CategoriesPage';
import LocationsPage from './pages/LocationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminCategories from './pages/AdminCategories';
import AdminSalesReport from './pages/AdminSalesReport';
import { productsAPI, promosAPI, getImageUrl } from './services/api';
import { products } from './data/products';

const promoBanners = [
  {
    id: 1,
    image: '/assets/joran-pancing-tua-dan-air-laut-biru_34013-35.avif',
    title: 'Perlengkapan Mancing Kualitas Terbaik',
    subtitle: 'Temukan alat pancing terbaik dengan harga bersahabat',
    buttonText: 'Belanja Sekarang'
  },
  {
    id: 2,
    image: '/assets/joran-pancing-tua-dan-air-laut-biru_34013-35.avif',
    title: 'Perlengkapan Mancing Kualitas Terbaik',
    subtitle: 'Temukan alat pancing terbaik dengan harga bersahabat',
    buttonText: 'Tambah Sekarang'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1506809598284-934c553a067a?q=80&w=1000&auto=format&fit=crop',
    title: 'Koleksi Umpan Terbaru',
    subtitle: 'Tingkatkan hasil tangkapan dengan umpan inovatif kami',
    buttonText: 'Cek Koleksi'
  }
];

const bundleProducts = [
  {
    id: 'bundle-1',
    name: 'Paket Mancing Pemula',
    description: 'Joran + Reel + Senar (Hemat 100rb)',
    originalPrice: 450000,
    price: 350000,
    image: 'https://images.unsplash.com/photo-1544336025-a136bfb10cc5?q=80&w=500&auto=format&fit=crop',
    items: ['Joran Shimano 180cm', 'Reel Daido 1000', 'Senar PE 0.8 100m']
  },
  {
    id: 'bundle-2',
    name: 'Paket Pro Casting',
    description: 'Baitcasting set lengkap dengan umpan',
    originalPrice: 850000,
    price: 699000,
    image: 'https://images.unsplash.com/photo-1551368321-4b1bd2422c15?q=80&w=500&auto=format&fit=crop',
    items: ['Joran BC Carbon 190cm', 'Reel BC 7.2:1', 'Minnow Lure 3pcs']
  }
];

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
  const [activeBanner, setActiveBanner] = useState(0);
  const [apiProducts, setApiProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // Will populate from API
  const [promos, setPromos] = useState([]); // Will populate from API
  const [bundlingProducts, setBundlingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cartItems, addToCart, updateQuantity, removeFromCart, totalPrice, cartCount } = useCart();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch products
        const response = await productsAPI.getAll({});
        const fetchedProducts = response.data.data || [];
        setApiProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
        
        // Extract bundling products
        const bundles = fetchedProducts.filter(p => p.category && p.category.name === 'Bundling');
        setBundlingProducts(bundles);

        // Fetch promos
        try {
          const promoRes = await promosAPI.getActivePromos();
          if (promoRes.data && promoRes.data.data && promoRes.data.data.length > 0) {
            setPromos(promoRes.data.data);
          } else {
            setPromos(promoBanners); // Fallback to mock if empty
          }
        } catch (e) {
          console.error('Failed to fetch promos', e);
          setPromos(promoBanners); // Fallback
        }
        
      } catch (err) {
        console.error('Failed to fetch initial products:', err);
        setApiProducts(products);
        setFilteredProducts(products);
        setPromos(promoBanners);
        setBundlingProducts(bundleProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto slide banner
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => {
        const length = promos.length > 0 ? promos.length : promoBanners.length;
        return (prev + 1) % length;
      });
    }, 5000);
    return () => clearInterval(timer);
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

      // Debug log untuk melihat params yang dikirim
      console.log('API Call with params:', params);
      
      const response = await productsAPI.getAll(params);
      console.log('API Response:', response);
      
      const data = response.data.data || response.data || [];
      console.log('Filtered products count:', data.length);
      setFilteredProducts(data);
    } catch (err) {
      console.error('Filter error:', err);
      console.error('Error details:', err.response?.data);
      // fallback to initial apiProducts or local
      setFilteredProducts(apiProducts.length > 0 ? apiProducts : products);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} ditambahkan ke keranjang!`, {
      icon: '🛒',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
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
            {/* Hero Banner Carousel */}
          <section className="relative h-64 md:h-80 bg-gray-900 overflow-hidden rounded-2xl mt-6 mb-8 group">
            {promos.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === activeBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img
                  src={banner.image_path ? getImageUrl(banner.image_path) : banner.image}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent"></div>
                <div className="relative h-full px-8 flex items-center">
                  <div className="max-w-2xl transform transition-transform duration-700 translate-y-0">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                      {banner.title}
                    </h1>
                    <p className="text-lg text-blue-50 mb-6 drop-shadow-md">
                      {banner.subtitle}
                    </p>
                    <button
                      onClick={() => setIsFilterOpen(true)}
                      className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-all shadow-lg hover:scale-105"
                    >
                      {banner.button_text || banner.buttonText || 'Belanja Sekarang'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Banner Controls */}
            <button
              onClick={() => setActiveBanner((prev) => (prev === 0 ? promos.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white z-20 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={() => setActiveBanner((prev) => (prev + 1) % promos.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white z-20 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            >
              <FiChevronRight size={24} />
            </button>

            {/* Banner Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {promos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveBanner(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === activeBanner ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </section>
          {/* Features Section */}
          <section className="py-12 -mt-8 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow border border-gray-100">
                  {feature.icon}
                  <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.subtitle}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Paket Bundling Section */}
          <section className="py-12 bg-gradient-to-b from-white to-blue-50 rounded-3xl px-6 my-8 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-orange-500">🔥</span> Paket Bundling Pilihan
                </h2>
                <p className="text-gray-500 mt-1">Beli sepaket lebih hemat dan praktis!</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bundlingProducts.map((bundle) => {
                const isRealProduct = bundle.id !== 'bundle-1' && bundle.id !== 'bundle-2';
                // Calculate prices
                const price = isRealProduct ? parseFloat(bundle.price) : bundle.price;
                const originalPrice = isRealProduct ? (price * 1.25) : bundle.originalPrice; // Mock original price for real bundles
                const items = isRealProduct 
                  ? (bundle.specifications && bundle.specifications.length > 0 ? bundle.specifications : bundle.description.split('+').map(i => i.trim()))
                  : bundle.items;
                const imageUrl = isRealProduct ? getImageUrl(bundle.image) : bundle.image;

                return (
                <div key={bundle.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow flex flex-col sm:flex-row border border-gray-100">
                  {/* Image */}
                  <div className="sm:w-2/5 h-48 sm:h-auto relative cursor-pointer" onClick={() => isRealProduct ? window.location.href = `/product/${bundle.id}` : null}>
                    <img src={imageUrl} alt={bundle.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
                      HEMAT Rp{(originalPrice - price).toLocaleString('id-ID')}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-gray-800 mb-1 cursor-pointer hover:text-blue-600" onClick={() => isRealProduct ? window.location.href = `/product/${bundle.id}` : null}>{bundle.name}</h3>
                    <p className="text-sm text-blue-600 font-medium mb-3">{isRealProduct ? bundle.brand : bundle.description}</p>
                    
                    {/* Items */}
                    <div className="space-y-1 mb-4 flex-1">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                          <FaPlus className="text-green-500 w-3 h-3 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Price and Action */}
                    <div className="mt-auto flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-400 line-through mb-0.5">Rp{originalPrice.toLocaleString('id-ID')}</p>
                        <p className="text-xl font-bold text-gray-800">Rp{price.toLocaleString('id-ID')}</p>
                      </div>
                      <button 
                        onClick={() => handleAddToCart({ ...bundle, finalPrice: price })}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                </div>
              )})}
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
  const { token, isInitializing } = useAuth();
  
  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Memuat...</div>;
  }
  
  return token ? children : <Navigate to="/login" />;
}

// Protected Admin Route Component
function ProtectedAdminRoute({ children }) {
  const { token, user, isInitializing } = useAuth();
  
  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Memuat...</div>;
  }
  
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
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/locations" element={<LocationsPage />} />
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
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
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
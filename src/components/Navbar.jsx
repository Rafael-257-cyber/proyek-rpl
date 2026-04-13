// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiLogOut, FiSearch, FiHeart, FiUser, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { GiFishingHook } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = ({ cartCount, onCartClick, onSearch }) => {
  const { user, logout, token } = useAuth();
  const { cartItems, totalPrice } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const menuItems = [
    { label: 'Beranda', href: '/' },
    { label: 'Kategori', href: '#kategori' },
    { label: 'Lokasi Mancing', href: '#lokasi' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md w-full">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 max-w-none">
          <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-4 lg:mb-0">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 flex-shrink-0">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GiFishingHook className="text-2xl text-white" />
              </div>
              <span className="text-lg font-bold text-gray-800 hidden sm:inline">
                FISHING<br className="lg:hidden" /><span className="text-blue-600"> GEAR</span>
              </span>
            </Link>

            {/* Search Bar - Hidden on Mobile */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl ml-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Cari produk, kategori, atau merek..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <FiSearch size={18} />
                </button>
              </div>
            </form>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
              {/* Wishlist */}
              <button
                onClick={() => navigate('/wishlist')}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors hidden sm:block"
                aria-label="Wishlist"
              >
                <FiHeart className="text-xl text-gray-700" />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              {/* Cart Button */}
              <button
                onClick={onCartClick}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Cart"
              >
                <FiShoppingCart className="text-xl text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

            {/* User Button with Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative hidden sm:block"
              >
                <FiUser className="text-xl text-gray-700" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {!token ? (
                    <>
                      <div className="p-4 border-b border-gray-100">
                        <p className="text-sm text-gray-600 mb-4">Silahkan masuk atau buat akun baru</p>
                        <Link
                          to="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block w-full text-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors mb-3"
                        >
                          Masuk
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Daftar
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 mb-1">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Pesanan Saya
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Wishlist
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors font-medium"
                          >
                            Dashboard Admin
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                            navigate('/login');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-gray-100 mt-2"
                        >
                          <FiLogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <FiSearch size={18} />
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block bg-white border-t border-gray-200 w-full`}>
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-none">
          <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-8 py-3">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-gray-700 font-medium hover:text-blue-600 transition-colors py-2 lg:py-0"
              >
                {item.label}
              </Link>
            ))}
          </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
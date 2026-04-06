// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiLogOut } from 'react-icons/fi';
import { GiFishingHook } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = ({ cartCount, onCartClick }) => {
  const { user, logout, token } = useAuth();
  const { cartItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-30 bg-white shadow-md backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <GiFishingHook className="text-3xl text-blue-600" />
            <span className="text-xl font-bold text-gray-800 hidden sm:inline">
              Fish<span className="text-blue-600">Gear</span>
            </span>
          </Link>

          {/* Right Side - Auth & Cart */}
          <div className="flex items-center gap-4">
            {token && user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 hidden sm:inline">
                  Halo, <span className="font-medium">{user.name}</span>
                </span>
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Cart"
            >
              <FiShoppingCart className="text-2xl text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Auth Buttons */}
            {!token ? (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Daftar
                </Link>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                {cartItems.length > 0 && (
                  <Link
                    to="/checkout"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Checkout (Rp {totalPrice.toLocaleString('id-ID')})
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-red-600"
                  title="Logout"
                >
                  <FiLogOut className="text-2xl" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
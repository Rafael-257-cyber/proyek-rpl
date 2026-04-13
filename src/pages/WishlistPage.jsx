import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiChevronRight, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const [cartOpen, setCartOpen] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar cartCount={0} onCartClick={() => setCartOpen(true)} />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm text-gray-600">
            <Link to="/" className="text-blue-600 hover:text-blue-700">Beranda</Link>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-gray-800 font-medium">Favorit Saya</span>
          </div>

          {/* Page Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Favorit Saya</h1>

          {wishlistItems.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Favorit</h2>
              <p className="text-gray-600 mb-6">Produk favorit Anda akan ditampilkan di sini. Mulai tambahkan produk ke favorit!</p>
              <Link
                to="/"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
                  {/* Product Image */}
                  <div className="relative overflow-hidden bg-gray-100 aspect-square">
                    <img
                        src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                      aria-label="Remove from wishlist"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {product.description}
                    </p>

                    {/* Price */}
                    <div className="mb-4">
                      <p className="text-xl font-bold text-blue-600">
                        {formatPrice(product.price)}
                      </p>
                      {product.original_price && product.original_price > product.price && (
                        <p className="text-sm text-gray-500 line-through">
                          {formatPrice(product.original_price)}
                        </p>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mb-4">
                      <p className={`text-sm font-semibold ${
                        product.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.stock > 0 ? `Stok: ${product.stock}` : 'Stok Habis'}
                      </p>
                    </div>

                    {/* Add to Cart Button */}
                    <Link
                      to={`/product/${product.id}`}
                      className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {wishlistItems.length > 0 && (
            <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 font-medium">Total Produk Favorit</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{wishlistItems.length}</p>
                </div>
                <Link
                  to="/"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                >
                  Lanjut Belanja
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

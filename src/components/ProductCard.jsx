// src/components/ProductCard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl } from '../services/api';

const ProductCard = ({ product, onAddToCart }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(isInWishlist(product.id));
  }, [product.id, isInWishlist]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    setIsWishlisted(!isWishlisted);
  };

  // Handle Promo Logic
  let originalPrice = product.price;
  let currentPrice = product.price;
  let activePromo = null;

  if (product.promos && product.promos.length > 0) {
    activePromo = product.promos[0]; // Take the first active promo
    const discountAmount = (originalPrice * activePromo.discount_percentage) / 100;
    currentPrice = originalPrice - discountAmount;
  }

  // Set finalPrice for Add to Cart
  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart({ ...product, finalPrice: currentPrice });
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
      <Link to={`/product/${product.id}`} className="block relative">
        <div className="relative overflow-hidden bg-gray-100 aspect-square">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <div className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full w-fit">
              {typeof product.category === 'object' ? product.category?.name : product.category}
            </div>
            {activePromo && (
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm w-fit">
                Diskon {parseFloat(activePromo.discount_percentage)}%
              </div>
            )}
          </div>
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all"
            aria-label="Toggle wishlist"
          >
            <FiHeart
              className={`text-lg transition-colors ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            />
          </button>
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/product/${product.id}`} className="block hover:text-blue-600 transition-colors">
          <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">{product.name}</h3>
        </Link>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            {activePromo && (
              <p className="text-xs text-gray-400 line-through mb-0.5">{formatPrice(originalPrice)}</p>
            )}
            <span className="text-xl font-bold text-blue-600">{formatPrice(currentPrice)}</span>
          </div>
          <button
            onClick={handleAddToCartClick}
            disabled={product.stock <= 0}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
            aria-label="Add to cart"
          >
            <FiShoppingCart className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
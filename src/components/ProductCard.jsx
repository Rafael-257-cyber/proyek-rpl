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

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden bg-gray-100 aspect-square">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {typeof product.category === 'object' ? product.category?.name : product.category}
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
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</span>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors shadow-md"
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
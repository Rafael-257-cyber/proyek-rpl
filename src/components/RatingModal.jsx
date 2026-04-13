import React, { useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import { ordersAPI, getImageUrl } from '../services/api';

export default function RatingModal({ isOpen, onClose, orderItem, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Silakan pilih bintang rating');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await ordersAPI.submitRating({
        order_item_id: orderItem.id,
        rating,
        review,
      });

      if (response.data.message.includes('berhasil')) {
        setRating(0);
        setReview('');
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan rating');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !orderItem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Beri Rating Produk</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="flex gap-4">
            <img
              src={getImageUrl(orderItem.product?.image) || '/placeholder.png'}
              alt={orderItem.product?.name}
              className="w-16 h-16 object-cover rounded-lg bg-gray-200"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 line-clamp-2">
                {orderItem.product?.name}
              </h3>
              <p className="text-sm text-gray-500">{orderItem.quantity}x Pembelian</p>
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rating Produk
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <FaStar
                    size={40}
                    className={`${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-blue-600 mt-2 font-medium">
                {rating === 1
                  ? 'Sangat Buruk'
                  : rating === 2
                  ? 'Buruk'
                  : rating === 3
                  ? 'Biasa'
                  : rating === 4
                  ? 'Bagus'
                  : 'Sangat Bagus'}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ulasan (Opsional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Bagikan pengalaman Anda dengan produk ini..."
              maxLength="1000"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {review.length}/1000 karakter
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : 'Kirim Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

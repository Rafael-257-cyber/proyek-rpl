import React, { useState, useRef } from 'react';
import { FaStar, FaTimes, FaImage, FaTrash } from 'react-icons/fa';
import { ordersAPI, getImageUrl } from '../services/api';

export default function RatingModal({ isOpen, onClose, orderItem, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Ukuran gambar maksimal 2MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Silakan pilih bintang rating');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('order_item_id', orderItem.id);
      formData.append('rating', rating);
      if (review) formData.append('review', review);
      if (image) formData.append('image', image);

      const response = await ordersAPI.submitRating(formData);

      if (response.data.message.includes('berhasil')) {
        setRating(0);
        setReview('');
        setImage(null);
        setImagePreview(null);
        onSuccess();
        onClose();
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        const firstError = Object.values(errorData.errors)[0][0];
        setError(firstError);
      } else {
        setError(errorData?.message || 'Gagal menyimpan rating');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !orderItem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Beri Rating Produk</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
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

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto Produk (Opsional)
            </label>
            {!imagePreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center"
              >
                <FaImage className="text-gray-400 text-3xl mb-2" />
                <p className="text-sm text-gray-500 font-medium">Klik untuk unggah foto</p>
                <p className="text-xs text-gray-400 mt-1">Maks. 2MB (JPG, PNG, GIF)</p>
              </div>
            ) : (
              <div className="relative inline-block border rounded-lg p-1 bg-gray-50">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="h-24 object-contain rounded"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow hover:bg-red-600 transition-colors"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg, image/png, image/jpg, image/gif"
              className="hidden"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 shrink-0">
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

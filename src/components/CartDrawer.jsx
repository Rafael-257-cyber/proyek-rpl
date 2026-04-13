// src/components/CartDrawer.jsx
import React from 'react';
import { FiX, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../services/api';

const CartDrawer = ({ isOpen, onClose, cartItems, updateQuantity, removeFromCart, totalPrice }) => {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Keranjang Belanja
              </h2>
              <p className="text-sm text-gray-500 mt-1">({cartItems.length})</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close cart"
            >
              <FiX className="text-2xl text-gray-600" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="text-center py-12 px-6">
                <p className="text-gray-500 text-lg">Keranjang kosong</p>
                <p className="text-sm text-gray-400 mt-1">Tambahkan produk untuk memulai belanja</p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="sticky top-0 bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                    <div className="col-span-5">Produk</div>
                    <div className="col-span-2 text-right">Harga</div>
                    <div className="col-span-2 text-center">Jumlah</div>
                    <div className="col-span-3 text-right">Subtotal</div>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Product Info */}
                        <div className="col-span-5">
                          <div className="flex gap-3">
                            <img
                                src={getImageUrl(item.image)}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-md bg-gray-100"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-800 text-sm line-clamp-2">{item.name}</h3>
                              <p className="text-xs text-gray-500 mt-1">
                                Rp{item.price.toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-2 text-right">
                          <p className="text-sm font-medium text-gray-800">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Quantity */}
                        <div className="col-span-2">
                          <div className="flex items-center border border-gray-300 rounded-lg w-fit mx-auto">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="p-1 text-gray-600 hover:bg-gray-100 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <FiMinus className="text-xs" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-10 text-center text-sm focus:outline-none border-l border-r border-gray-300"
                            />
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-gray-600 hover:bg-gray-100 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <FiPlus className="text-xs" />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal & Delete */}
                        <div className="col-span-3 flex items-center justify-between">
                          <p className="font-bold text-gray-800 text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="Remove item"
                          >
                            <FiTrash2 className="text-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 bg-white">
              {/* Total */}
              <div className="px-6 py-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total Belanja</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="p-6 space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md"
                >
                  Checkout
                </button>
                <button
                  onClick={handleContinueShopping}
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-semibold transition-colors"
                >
                  Lanjut Belanja
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
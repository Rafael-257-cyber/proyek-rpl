import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiChevronRight, FiStar, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl, productsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartCount } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productsAPI.getOne(id);
        const fetchedProduct = res.data.product || res.data;
        setProduct(fetchedProduct);
        if (fetchedProduct) setIsWishlisted(isInWishlist(fetchedProduct.id));
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, isInWishlist]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar cartCount={cartCount} onCartClick={() => {}} onSearch={() => {}} />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Memuat produk...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar
          cartCount={cartCount}
          onCartClick={() => {}}
          onSearch={() => {}}
        />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Produk Tidak Ditemukan</h1>
            <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Kembali ke Beranda
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Mock data untuk images galeri
  const productImages = [
    product.image,
    product.image,
    product.image,
    product.image,
  ]; // Dibuat 4 karena UI nya butuh 4 gambar thumbnail

  // Use actual product details or fallback to mock
  const productDetails = {
    rating: 4.8, // Should ideally come from backend
    reviews: 120, // Should ideally come from backend
    sold: 356, // Should ideally come from backend
    brand: product.brand || '-',
    category: typeof product.category === 'object' ? product.category?.name : (product.category || '-'),
    location: product.location || '-',
    discount: 0,
    originalPrice: product.price,
  };

  const finalPrice = product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    // Optional: show toast notification
    alert(`${quantity} item(s) ditambahkan ke keranjang!`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleWishlistToggle = () => {
    if (product) {
      toggleWishlist(product);
      setIsWishlisted(!isWishlisted);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar
        cartCount={cartCount}
        onCartClick={() => {}}
        onSearch={() => {}}
      />

      <main className="flex-1 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-none py-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
            <Link to="/" className="hover:text-blue-600 transition-colors">Beranda</Link>
            <FiChevronRight size={16} />
            <span className="cursor-pointer hover:text-blue-600 transition-colors">{productDetails.category}</span>
            <FiChevronRight size={16} />
            <span className="text-gray-800 font-medium">{product.name}</span>
          </div>

          {/* Product Details Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left: Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="bg-gray-50 rounded-lg overflow-hidden mb-4 aspect-square flex items-center justify-center border border-gray-200">
                <img
                  src={getImageUrl(productImages[selectedImage])}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                      selectedImage === idx
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Details */}
            <div>
              {/* Product Title */}
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={18}
                      className={i < Math.floor(productDetails.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {productDetails.rating} ({productDetails.reviews} Ulasan)
                </span>
                <span className="text-sm text-green-600 font-medium">● Terjual {productDetails.sold}</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-gray-800">
                    Rp{finalPrice.toLocaleString('id-ID')}
                  </span>
                  {productDetails.discount > 0 && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        Rp{productDetails.originalPrice.toLocaleString('id-ID')}
                      </span>
                      <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded">
                        -{productDetails.discount}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Merek:</span>
                  <span className="font-semibold text-gray-800">{productDetails.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kategori:</span>
                  <span className="font-semibold text-gray-800">{productDetails.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lokasi Mancing:</span>
                  <span className="font-semibold text-gray-800">{productDetails.location}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">Deskripsi</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>

              {/* Stock Status */}
              <div className="mb-6 flex items-center gap-2">
                <span className="text-gray-600">Stok:</span>
                {product.stock > 0 ? (
                  <span className="text-green-600 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Tersedia ({product.stock})
                  </span>
                ) : (
                  <span className="text-red-500 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Habis
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-600 font-medium">Jumlah:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center focus:outline-none border-l border-r border-gray-300"
                  />
                  <button
                    onClick={incrementQuantity}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 px-6 py-3 border-2 border-blue-500 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <FiShoppingCart size={20} />
                  Tambah ke Keranjang
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Beli Sekarang
                </button>
              </div>

              {/* Wishlist */}
              <button
                onClick={handleWishlistToggle}
                className={`w-full mt-3 py-3 border font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  isWishlisted
                    ? 'bg-red-50 border-red-500 text-red-600 hover:bg-red-100'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiHeart size={20} className={isWishlisted ? 'fill-current' : ''} />
                {isWishlisted ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Pengiriman</h3>
              <p className="text-sm text-gray-600">Gratis ongkos kirim untuk pembelian minimal Rp300.000</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Garansi</h3>
              <p className="text-sm text-gray-600">Garansi resmi dari pabrik selama 1 tahun</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Kembalian</h3>
              <p className="text-sm text-gray-600">Kebijakan pengembalian 30 hari jika tidak puas</p>
            </div>
          </div>
        </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/filters/categories');
      setCategories(response.data.categories);

      // Fetch product counts for each category
      const counts = {};
      for (const category of response.data.categories) {
        try {
          const productsResponse = await api.get('/products', {
            params: { category_id: category.id, limit: 1 }
          });
          counts[category.id] = productsResponse.data.total || 0;
        } catch (err) {
          counts[category.id] = 0;
        }
      }
      setProductCounts(counts);
      setError(null);
    } catch (err) {
      setError('Gagal memuat kategori. Silakan coba lagi.');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/?category_id=${categoryId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Kategori Produk</h1>
            <p className="text-gray-600 text-lg">Jelajahi berbagai kategori alat dan perlengkapan mancing kami</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Categories Grid */}
          {!loading && categories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer group"
                >
                  {/* Category Header with Gradient */}
                  <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300 flex items-center justify-center">
                    <h2 className="text-2xl font-bold text-white text-center px-4">{category.name}</h2>
                  </div>

                  {/* Category Content */}
                  <div className="p-6">
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {category.description || 'Kategori produk untuk kebutuhan mancing Anda'}
                    </p>

                    {/* Product Count */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">Total Produk:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {productCounts[category.id] || 0}
                      </span>
                    </div>

                    {/* View Products Button */}
                    <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform group-hover:scale-105">
                      Lihat Produk
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && categories.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Tidak ada kategori yang tersedia</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

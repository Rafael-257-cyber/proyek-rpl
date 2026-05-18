import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [locationStats, setLocationStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Deskripsi untuk setiap lokasi
  const locationDescriptions = {
    'Air Asin/Laut': 'Jelajahi koleksi lengkap peralatan untuk mancing di laut dan air asin. Produk-produk berkualitas tinggi yang tahan terhadap kondisi air asin ekstrem.',
    'Air Tawar': 'Peralatan khusus untuk mancing di danau, sungai, dan kolam air tawar. Desain ergonomis untuk kenyamanan maksimal saat memancing.',
    'Kolam': 'Perlengkapan mancing ideal untuk kolam ikan umum atau pribadi. Cocok untuk pemula dan pengalaman mancing santai bersama keluarga.'
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/filters/locations');
      setLocations(response.data.locations);

      // Fetch statistics for each location
      const stats = {};
      for (const location of response.data.locations) {
        try {
          const productsResponse = await api.get('/products', {
            params: { location: location, limit: 100 }
          });
          
          // Calculate average rating
          const products = productsResponse.data.data || [];
          let totalRating = 0;
          let ratingCount = 0;

          for (const product of products) {
            if (product.average_rating) {
              totalRating += product.average_rating;
              ratingCount++;
            }
          }

          stats[location] = {
            productCount: productsResponse.data.total || 0,
            averageRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0,
            ratingCount: ratingCount
          };
        } catch (err) {
          stats[location] = {
            productCount: 0,
            averageRating: 0,
            ratingCount: 0
          };
        }
      }
      setLocationStats(stats);
      setError(null);
    } catch (err) {
      setError('Gagal memuat lokasi mancing. Silakan coba lagi.');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationClick = (location) => {
    navigate(`/?location=${encodeURIComponent(location)}`);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Lokasi Mancing</h1>
            <p className="text-gray-600 text-lg">Temukan peralatan mancing yang tepat sesuai jenis lokasi mancing Anda</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Locations Grid */}
          {!loading && locations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location) => (
                <div
                  key={location}
                  onClick={() => handleLocationClick(location)}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
                >
                  {/* Location Header with Gradient */}
                  <div className="h-24 bg-gradient-to-r from-green-500 to-emerald-600 group-hover:from-green-600 group-hover:to-emerald-700 transition-all duration-300 flex items-center justify-center">
                    <h2 className="text-2xl font-bold text-white text-center px-4">{location}</h2>
                  </div>

                  {/* Location Content */}
                  <div className="p-6">
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {locationDescriptions[location]}
                    </p>

                    {/* Stats */}
                    <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                      {/* Product Count */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Total Produk:</span>
                        <span className="font-semibold text-gray-900">
                          {locationStats[location]?.productCount || 0}
                        </span>
                      </div>

                      {/* Average Rating */}
                      {locationStats[location]?.averageRating > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Rating Rata-rata:</span>
                          <div className="text-right">
                            {renderStars(locationStats[location]?.averageRating)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* View Products Button */}
                    <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform group-hover:scale-105">
                      Lihat Produk
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && locations.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Tidak ada lokasi mancing yang tersedia</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

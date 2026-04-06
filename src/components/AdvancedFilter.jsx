import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';

export default function AdvancedFilter({ onFilterChange }) {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: [],
    brand: '',
    min_price: '',
    max_price: '',
    in_stock: false,
  });

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [catRes, locRes, brandRes] = await Promise.all([
          productsAPI.getCategories(),
          productsAPI.getLocations(),
          productsAPI.getBrands(),
        ]);
        setCategories(catRes.data.categories || []);
        setLocations(locRes.data.locations || []);
        setBrands(brandRes.data.brands || []);
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleLocationToggle = (location) => {
    const newLocations = filters.location.includes(location)
      ? filters.location.filter((l) => l !== location)
      : [...filters.location, location];
    handleFilterChange('location', newLocations);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      category: '',
      location: [],
      brand: '',
      min_price: '',
      max_price: '',
      in_stock: false,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  if (loading) {
    return <div className="text-center py-4">Loading filters...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Pencarian Lanjutan</h2>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cari Produk
          </label>
          <input
            type="text"
            placeholder="Nama produk..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Merk
          </label>
          <select
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Merk</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Harga Minimum (Rp)
          </label>
          <input
            type="number"
            placeholder="0"
            value={filters.min_price}
            onChange={(e) => handleFilterChange('min_price', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Harga Maksimum (Rp)
          </label>
          <input
            type="number"
            placeholder="999999999"
            value={filters.max_price}
            onChange={(e) => handleFilterChange('max_price', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lokasi Mancing
          </label>
          <div className="space-y-2">
            {locations.map((location) => (
              <label key={location} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.location.includes(location)}
                  onChange={() => handleLocationToggle(location)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{location}</span>
              </label>
            ))}
          </div>
        </div>

        {/* In Stock */}
        <div>
          <label className="flex items-center mt-7">
            <input
              type="checkbox"
              checked={filters.in_stock}
              onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Hanya Stok Tersedia</span>
          </label>
        </div>
      </div>
    </div>
  );
}

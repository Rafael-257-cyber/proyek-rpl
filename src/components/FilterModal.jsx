import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { productsAPI } from '../services/api';

export default function FilterModal({ isOpen, onClose, onFilterChange }) {
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

    if (isOpen) {
      fetchFilterOptions();
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Filter Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Filter Produk</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="text-2xl text-gray-600" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading filters...</div>
          ) : (
            <div className="space-y-6">
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

              {/* Price Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Min (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Max (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="999999999"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Lokasi Mancing
                </label>
                <div className="space-y-2">
                  {locations.map((location) => (
                    <label key={location} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.location.includes(location)}
                        onChange={() => handleLocationToggle(location)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="ml-2 text-sm text-gray-700">{location}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* In Stock */}
              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.in_stock}
                    onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Hanya Stok Tersedia
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Terapkan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

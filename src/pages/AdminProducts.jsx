import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AdminLayout from '../components/AdminLayout';
import { adminAPI, getImageUrl } from '../services/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    stock: '',
    brand: '',
    location: '',
    specifications: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      // Try public endpoint first (no auth required)
      const res = await fetch('/api/products/filters/categories');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      console.log('Categories from public endpoint:', data);
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Fallback to admin endpoint
      try {
        const res = await adminAPI.getCategories();
        console.log('Categories from admin endpoint:', res);
        setCategories(res.data?.categories || []);
      } catch (adminErr) {
        console.error('Admin categories also failed:', adminErr);
        setCategories([]);
      }
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAdminProducts();
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err.response?.data?.message || 'Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      category_id: '',
      price: '',
      stock: '',
      brand: '',
      location: '',
      specifications: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      category_id: product.category_id,
      price: product.price,
      stock: product.stock,
      brand: product.brand,
      location: product.location,
      specifications: JSON.stringify(product.specifications || {})
    });
    setImageFile(null);
    setImagePreview(product.image ? getImageUrl(product.image) : null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus produk ini?')) {
      try {
        await adminAPI.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus produk');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validasi category_id
      if (!formData.category_id) {
        alert('Silakan pilih kategori');
        return;
      }
      
      const categoryId = parseInt(formData.category_id);
      if (isNaN(categoryId)) {
        alert('Category ID harus berupa angka valid');
        return;
      }
      
      const payload = new FormData();
      
      // Add form fields - ensure they're in correct type
      payload.append('name', formData.name);
      payload.append('description', formData.description);
      payload.append('category_id', categoryId.toString()); // Send as string that can be converted to int
      payload.append('price', parseFloat(formData.price).toString());
      payload.append('stock', parseInt(formData.stock).toString());
      payload.append('brand', formData.brand || '');
      
      // Only append location if it has a value
      if (formData.location) {
        payload.append('location', formData.location);
      }
      
      // Always append specifications as JSON string
      if (formData.specifications && formData.specifications.trim()) {
        try {
          // Validate it's valid JSON
          JSON.parse(formData.specifications);
          payload.append('specifications', formData.specifications);
        } catch (e) {
          // If not valid JSON, send empty object
          payload.append('specifications', '{}');
        }
      } else {
        payload.append('specifications', '{}');
      }
      
      // Add image if exists
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editingId) {
        await adminAPI.updateProduct(editingId, payload);
      } else {
        await adminAPI.createProduct(payload);
      }

      fetchProducts();
      setShowForm(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      // Show detailed validation errors
      const errorMsg = err.response?.data?.errors 
        ? Object.entries(err.response.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n')
        : err.response?.data?.message || 'Gagal menyimpan produk';
      alert(errorMsg);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8"><p className="text-center text-gray-500">Memuat produk...</p></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Manajemen Produk</h2>
            <p className="text-gray-500 text-sm mt-1">Total: {filteredProducts.length} produk</p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaPlus /> Tambah Produk
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau brand..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-gray-600 font-semibold">Nama</th>
                <th className="px-6 py-3 text-left text-gray-600 font-semibold">Brand</th>
                <th className="px-6 py-3 text-left text-gray-600 font-semibold">Harga</th>
                <th className="px-6 py-3 text-left text-gray-600 font-semibold">Stok</th>
                <th className="px-6 py-3 text-left text-gray-600 font-semibold">Lokasi</th>
                <th className="px-6 py-3 text-center text-gray-600 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-700 font-medium">{product.name}</td>
                    <td className="px-6 py-3 text-gray-600">{product.brand}</td>
                    <td className="px-6 py-3 text-gray-700 font-semibold">Rp{product.price?.toLocaleString('id-ID') || 0}</td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.stock > 20 ? 'bg-green-100 text-green-700' :
                        product.stock > 5 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{product.location}</td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => handleEdit(product)}
                        className="inline-block px-3 py-1 text-blue-600 hover:bg-blue-50 rounded mr-2"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="inline-block px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Tidak ada produk</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Halaman {currentPage} dari {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-200 px-6 py-4 flex items-center justify-between border-b">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingId ? 'Edit Produk' : 'Tambah Produk'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-600 hover:text-gray-800">×</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Image Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="flex flex-col items-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-40 h-40 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-gray-600 font-medium">Klik untuk upload foto produk</p>
                        <p className="text-gray-500 text-sm">atau drag & drop</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="imageInput"
                    />
                    <label
                      htmlFor="imageInput"
                      className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Pilih Foto
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nama Produk"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Harga"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Stok"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Lokasi</option>
                    <option value="Air Asin/Laut">Air Asin/Laut</option>
                    <option value="Air Tawar">Air Tawar</option>
                    <option value="Kolam">Kolam</option>
                  </select>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="Deskripsi"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

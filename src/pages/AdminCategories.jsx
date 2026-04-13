import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import AdminLayout from '../components/AdminLayout';
import { adminAPI } from '../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getCategories();
      setCategories(res.data.categories || res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError(err.response?.data?.message || 'Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setShowForm(true);
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus kategori ini?')) {
      try {
        await adminAPI.deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus kategori');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminAPI.updateCategory(editingId, formData);
      } else {
        await adminAPI.createCategory(formData);
      }
      fetchCategories();
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan kategori');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8"><p className="text-center text-gray-500">Memuat kategori...</p></div>
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
            <h2 className="text-2xl font-bold text-gray-800">Manajemen Kategori</h2>
            <p className="text-gray-500 text-sm mt-1">Total: {categories.length} kategori</p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaPlus /> Tambah Kategori
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">Tidak ada kategori</p>
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
              <div className="bg-gray-200 px-6 py-4 flex items-center justify-between border-b">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingId ? 'Edit Kategori' : 'Tambah Kategori'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-600 hover:text-gray-800 text-2xl">×</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <input
                  type="text"
                  placeholder="Nama Kategori"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <textarea
                  placeholder="Deskripsi"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
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

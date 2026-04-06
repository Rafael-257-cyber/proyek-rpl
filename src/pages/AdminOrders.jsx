import React, { useState, useEffect } from 'react';
import { FaSearch, FaCheckCircle, FaTimesCircle, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AdminLayout from '../components/AdminLayout';
import { adminAPI } from '../services/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', tracking_number: '' });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAdminOrders();
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.message || 'Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId) => {
    try {
      await adminAPI.verifyPayment(orderId);
      fetchOrders();
      alert('Pembayaran terverifikasi');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal verifikasi pembayaran');
    }
  };

  const handleRejectPayment = async (orderId) => {
    try {
      await adminAPI.rejectPayment(orderId);
      fetchOrders();
      alert('Pembayaran ditolak');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal tolak pembayaran');
    }
  };

  const handleUpdateStatus = async (orderId) => {
    try {
      await adminAPI.updateOrderStatus(orderId, {
        status: updateForm.status,
        tracking_number: updateForm.tracking_number
      });
      fetchOrders();
      setSelectedOrder(null);
      alert('Pesanan diperbarui');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui pesanan');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toString().includes(searchTerm) || o.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8"><p className="text-center text-gray-500">Memuat pesanan...</p></div>
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
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Pesanan</h2>
          <p className="text-gray-500 text-sm mt-1">Total: {filteredOrders.length} pesanan</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-3">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID atau nama pembeli..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Diproses</option>
            <option value="shipped">Dikirim</option>
            <option value="delivered">Diterima</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-gray-600 font-semibold">ID</th>
                <th className="px-6 py-3 text-left text-gray-600 font-semibold">Pembeli</th>
                <th className="px-6 py-3 text-left text-gray-600 font-semibold">Total</th>
                <th className="px-6 py-3 text-left text-gray-600 font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-gray-600 font-semibold">Pembayaran</th>
                <th className="px-6 py-3 text-left text-gray-600 font-semibold">Tanggal</th>
                <th className="px-6 py-3 text-center text-gray-600 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-700 font-semibold">#{order.id}</td>
                    <td className="px-6 py-3 text-gray-700">{order.user_name}</td>
                    <td className="px-6 py-3 text-gray-700 font-semibold">Rp{order.total_price?.toLocaleString('id-ID') || 0}</td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.payment_status === 'verified' ? 'bg-green-100 text-green-700' :
                        order.payment_status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.payment_status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-xs">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setUpdateForm({ status: order.status, tracking_number: order.tracking_number || '' });
                        }}
                        className="inline-block px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">Tidak ada pesanan</td></tr>
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

        {/* Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-gray-200 px-6 py-4 flex items-center justify-between border-b">
                <h3 className="text-lg font-bold text-gray-800">Detail Pesanan #{selectedOrder.id}</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-600 hover:text-gray-800 text-2xl">×</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Pembeli</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.user_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Total</p>
                    <p className="font-semibold text-gray-800">Rp{selectedOrder.total_price?.toLocaleString('id-ID') || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Metode Pembayaran</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Status Pembayaran</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.payment_status || 'pending'}</p>
                  </div>
                </div>

                {/* Payment Verification */}
                {!selectedOrder.payment_status || selectedOrder.payment_status === 'rejected' ? (
                  <div className="border-t pt-4 space-y-3">
                    <p className="font-semibold text-gray-800">Verifikasi Pembayaran</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerifyPayment(selectedOrder.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <FaCheckCircle /> Terima
                      </button>
                      <button
                        onClick={() => handleRejectPayment(selectedOrder.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <FaTimesCircle /> Tolak
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Update Status */}
                <div className="border-t pt-4 space-y-3">
                  <p className="font-semibold text-gray-800">Update Status Pesanan</p>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Diproses</option>
                    <option value="shipped">Dikirim</option>
                    <option value="delivered">Diterima</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Nomor Tracking (opsional)"
                    value={updateForm.tracking_number}
                    onChange={(e) => setUpdateForm({...updateForm, tracking_number: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

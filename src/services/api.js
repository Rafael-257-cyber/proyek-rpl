import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/user'),
  logout: () => api.post('/auth/logout'),
};

// Product API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/filters/categories'),
  getLocations: () => api.get('/products/filters/locations'),
  getBrands: () => api.get('/products/filters/brands'),
};

// Order API
export const ordersAPI = {
  checkout: (data) => api.post('/orders/checkout', data),
  getUserOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  uploadPaymentProof: (orderId, file) => {
    const formData = new FormData();
    formData.append('payment_proof', file);
    return api.post(`/orders/${orderId}/payment-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`),
};

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getSalesChart: (params) => api.get('/admin/dashboard/sales-chart', { params }),

  // Products Management
  getAdminProducts: (params) => api.get('/admin/products', { params }),
  getAdminProduct: (id) => api.get(`/admin/products/${id}`),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  updateStock: (data) => api.post('/admin/products/update-stock', data),

  // Categories Management
  getCategories: (params) => api.get('/admin/categories', { params }),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Orders Management
  getAdminOrders: (params) => api.get('/admin/orders', { params }),
  getAdminOrder: (id) => api.get(`/admin/orders/${id}`),
  verifyPayment: (id) => api.post(`/admin/orders/${id}/verify-payment`),
  rejectPayment: (id) => api.post(`/admin/orders/${id}/reject-payment`),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  cancelAdminOrder: (id) => api.post(`/admin/orders/${id}/cancel`),
};

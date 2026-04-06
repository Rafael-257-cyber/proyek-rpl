import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaChartBar,
  FaBoxes,
  FaClipboardList,
  FaTag,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaHome
} from 'react-icons/fa';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: FaChartBar, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FaBoxes, label: 'Produk', path: '/admin/products' },
    { icon: FaClipboardList, label: 'Pesanan', path: '/admin/orders' },
    { icon: FaTag, label: 'Kategori', path: '/admin/categories' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${
        isSidebarOpen ? 'w-64' : 'w-20'
      } bg-gradient-to-b from-blue-700 to-blue-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo Section */}
        <div className="p-4 border-b border-blue-600 flex items-center justify-between">
          {isSidebarOpen && (
            <div>
              <h1 className="text-xl font-bold">Toko Pancing</h1>
              <p className="text-xs text-blue-200">Admin Panel</p>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors text-left"
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-blue-600">
          {isSidebarOpen && (
            <div className="mb-4">
              <p className="text-xs text-blue-200">Logged in as</p>
              <p className="font-semibold text-sm truncate">{user?.name}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors text-left text-sm"
          >
            <FaSignOutAlt size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
            <p className="text-sm text-gray-500">Kelola toko pancing Anda</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <FaHome size={18} />
            <span>Kembali ke Toko</span>
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

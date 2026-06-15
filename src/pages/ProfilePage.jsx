import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, updateProfile, error: authError } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Pre-populate fields when user context is loaded
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
    if (!email.trim()) {
      newErrors.email = 'Alamat email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (password) {
      if (password.length < 6) {
        newErrors.password = 'Password baru minimal harus 6 karakter';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Konfirmasi password baru tidak cocok';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setErrors({});

    if (!validateForm()) return;

    setLoading(true);
    try {
      await updateProfile(name.trim(), email.trim().toLowerCase(), password || undefined);
      setSuccess('Profil Anda berhasil diperbarui!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      // Errors are handled and set in context or thrown
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Beranda</Link>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-blue-600 font-medium">Profil Saya</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Card Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100">
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 mx-auto text-3xl font-bold text-white shadow-md">
                  {getInitials(user?.name)}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                <span className={`inline-block mt-3 px-3 py-1 text-xs font-semibold rounded-full ${
                  user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {user?.role === 'admin' ? 'Administrator' : 'Pembeli'}
                </span>

                <div className="mt-8 pt-6 border-t border-gray-100 text-left text-sm text-gray-600 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status Akun</span>
                    <span className="font-semibold text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Aktif
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Terdaftar Sejak</span>
                    <span className="font-semibold text-gray-700">{formatDate(user?.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Edit Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">Edit Profil</h2>
                  <p className="text-sm text-gray-500 mt-1">Perbarui data diri dan kata sandi akun Anda.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {success && (
                    <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-3">
                      <FiCheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
                      <p className="text-sm font-semibold">{success}</p>
                    </div>
                  )}

                  {(authError || errors.form) && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
                      <p className="text-sm font-semibold">{authError || errors.form}</p>
                    </div>
                  )}

                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                    <div className="relative">
                      <div className="absolute left-4 top-3.5 text-gray-400">
                        <FiUser size={20} />
                      </div>
                      <input
                        type="text"
                        placeholder="Masukkan nama lengkap Anda"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                          errors.name
                            ? 'border-red-500 focus:border-red-500 bg-red-50'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {errors.name && <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Email</label>
                    <div className="relative">
                      <div className="absolute left-4 top-3.5 text-gray-400">
                        <FiMail size={20} />
                      </div>
                      <input
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                          errors.email
                            ? 'border-red-500 focus:border-red-500 bg-red-50'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>}
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Ubah Password</h3>
                    <p className="text-xs text-gray-500 mb-6">Kosongkan kolom di bawah ini jika Anda tidak ingin memperbarui password.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Password Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password Baru</label>
                        <div className="relative">
                          <div className="absolute left-4 top-3.5 text-gray-400">
                            <FiLock size={20} />
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min. 6 karakter"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                              errors.password
                                ? 'border-red-500 focus:border-red-500 bg-red-50'
                                : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                          </button>
                        </div>
                        {errors.password && <p className="mt-2 text-sm text-red-600 font-medium">{errors.password}</p>}
                      </div>

                      {/* Confirm Password Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Konfirmasi Password Baru</label>
                        <div className="relative">
                          <div className="absolute left-4 top-3.5 text-gray-400">
                            <FiLock size={20} />
                          </div>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Ulangi password baru"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                              errors.confirmPassword
                                ? 'border-red-500 focus:border-red-500 bg-red-50'
                                : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="mt-2 text-sm text-red-600 font-medium">{errors.confirmPassword}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                    >
                      {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

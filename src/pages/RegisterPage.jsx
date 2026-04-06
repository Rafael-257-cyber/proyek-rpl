import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GiFishingHook } from 'react-icons/gi';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const levels = ['', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
    const colors = ['', 'red', 'yellow', 'blue', 'green'];
    return { level: strength, text: levels[strength], color: colors[strength] };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!name) setErrors((prev) => ({ ...prev, name: 'Nama diperlukan' }));
    if (!email) setErrors((prev) => ({ ...prev, email: 'Email diperlukan' }));
    if (!password) setErrors((prev) => ({ ...prev, password: 'Password diperlukan' }));
    if (password !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Password tidak cocok' }));
    }

    if (!name || !email || !password || password !== confirmPassword) return;

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      // Error is handled by useAuth
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-col items-center justify-center space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mb-6 shadow-lg">
                <GiFishingHook className="text-5xl text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">FishGear</h1>
              <p className="text-lg text-gray-600">Toko Pancing Terpercaya</p>
            </div>
            
            <div className="max-w-sm space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-blue-600 mt-1">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Bergabung Sekarang</p>
                  <p className="text-gray-600 text-sm">Dapatkan akses ke ribuan produk pancing berkualitas</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-blue-600 mt-1">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Belanja Aman & Cepat</p>
                  <p className="text-gray-600 text-sm">Proses checkout yang mudah dan aman</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-blue-600 mt-1">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Dukungan Pelanggan</p>
                  <p className="text-gray-600 text-sm">Tim kami siap membantu Anda 24/7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                  Buat Akun Baru
                </h2>
                <p className="text-gray-600">
                  Bergabunglah dengan komunitas pemancing kami hari ini
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="relative p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                )}

                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-400">
                      <FiUser size={20} />
                    </div>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Masukkan nama lengkap Anda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.name 
                          ? 'border-red-500 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>}
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-400">
                      <FiMail size={20} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.email 
                          ? 'border-red-500 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>}
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-400">
                      <FiLock size={20} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-12 pr-12 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.password 
                          ? 'border-red-500 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
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
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`flex-1 h-1 rounded-full transition-colors ${
                              i <= passwordStrength.level
                                ? passwordStrength.color === 'red'
                                  ? 'bg-red-500'
                                  : passwordStrength.color === 'yellow'
                                  ? 'bg-yellow-500'
                                  : passwordStrength.color === 'blue'
                                  ? 'bg-blue-500'
                                  : 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      {passwordStrength.text && (
                        <p className={`text-xs font-medium ${
                          passwordStrength.color === 'red'
                            ? 'text-red-600'
                            : passwordStrength.color === 'yellow'
                            ? 'text-yellow-600'
                            : passwordStrength.color === 'blue'
                            ? 'text-blue-600'
                            : 'text-green-600'
                        }`}>
                          Kekuatan: {passwordStrength.text}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-400">
                      <FiLock size={20} />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-12 pr-12 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                        errors.confirmPassword 
                          ? 'border-red-500 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
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
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.confirmPassword}</p>
                  )}
                  
                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      {password === confirmPassword ? (
                        <>
                          <FiCheck size={18} className="text-green-500" />
                          <span className="text-xs text-green-600 font-medium">Password cocok</span>
                        </>
                      ) : (
                        <>
                          <FiX size={18} className="text-red-500" />
                          <span className="text-xs text-red-600 font-medium">Password tidak cocok</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-1" required />
                  <span className="text-sm text-gray-600">
                    Saya setuju dengan <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Syarat & Ketentuan</a> dan <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Kebijakan Privasi</a>
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || password !== confirmPassword}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Membuat akun...
                    </span>
                  ) : (
                    'Buat Akun'
                  )}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Sudah punya akun?{' '}
                  <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

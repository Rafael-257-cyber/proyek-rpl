import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GiFishingHook } from 'react-icons/gi';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setError('');

    if (!email) {
      setErrors((prev) => ({ ...prev, email: 'Email diperlukan' }));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({ ...prev, email: 'Format email tidak valid' }));
      return;
    }

    setLoading(true);

    try {
      // Simulasi API call untuk reset password
      // await forgotPasswordAPI.sendResetEmail(email);
      
      // Untuk saat ini, kita simulasikan delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      
      // Redirect ke login setelah 3 detik
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Silahkan coba lagi.');
    } finally {
      setLoading(false);
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
                  <p className="text-gray-700 font-semibold">Reset Mudah</p>
                  <p className="text-gray-600 text-sm">Proses reset password yang cepat dan aman</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-blue-600 mt-1">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Email Verifikasi</p>
                  <p className="text-gray-600 text-sm">Link reset akan dikirim ke email Anda</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-blue-600 mt-1">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Akun Aman</p>
                  <p className="text-gray-600 text-sm">Data Anda dilindungi dengan enkripsi tingkat tinggi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
              {!submitted ? (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                      Lupa Password?
                    </h2>
                    <p className="text-gray-600">
                      Tidak masalah! Kami akan membantu Anda reset password.
                    </p>
                  </div>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                      <div className="relative p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                      </div>
                    )}

                    {/* Info Text */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        Masukkan email yang terkait dengan akun Anda. Kami akan mengirimkan link untuk reset password ke email Anda.
                      </p>
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
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Mengirim link...
                        </span>
                      ) : (
                        'Kirim Link Reset'
                      )}
                    </button>
                  </form>

                  {/* Back to Login Link */}
                  <div className="mt-8 text-center">
                    <Link 
                      to="/login" 
                      className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                    >
                      <FiArrowLeft size={18} />
                      Kembali ke Login
                    </Link>
                  </div>
                </>
              ) : (
                // Success Message
                <div className="text-center space-y-6 py-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                    <FiCheck size={40} className="text-green-600" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Email Terkirim!
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Kami telah mengirimkan link reset password ke email Anda. Silahkan cek email (termasuk folder spam) dan ikuti instruksi untuk reset password.
                    </p>
                    <p className="text-sm text-gray-500">
                      Link akan berlaku selama 24 jam.
                    </p>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Tidak menerima email? Redirecting ke login dalam beberapa detik...
                    </p>
                    <Link 
                      to="/login" 
                      className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                    >
                      Kembali ke Login
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

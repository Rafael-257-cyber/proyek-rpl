import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GiFishingHook } from 'react-icons/gi';
import { FiMail, FiCheck, FiRotateCcw } from 'react-icons/fi';

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 menit
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email dari location state (dari register page)
  const email = location.state?.email || 'user@email.com';

  // Timer untuk resend OTP
  useEffect(() => {
    if (timeLeft === 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Hanya terima angka

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Ambil digit terakhir saja
    setOtp(newOtp);
    setError('');

    // Auto-focus ke input berikutnya
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);

      // Auto-focus ke input sebelumnya
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle paste dari clipboard
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) {
      setError('Hanya angka yang diperbolehkan');
      return;
    }

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);
    
    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  // Verify OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Silahkan masukkan 6 digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulasi API call untuk verify OTP
      // await verifyOTPAPI.verify(email, otpCode);
      
      // Untuk saat ini, kita simulasikan delay dan accept any 6 digit
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Jika OTP yang dimasukkan adalah "000000" maka error
      if (otpCode === '000000') {
        throw new Error('Kode OTP tidak valid');
      }

      setSuccess(true);

      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        navigate('/login', { state: { message: 'Email berhasil diverifikasi! Silahkan login.' } });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Verifikasi OTP gagal');
    } finally {
      setLoading(false);
    }
  };

  // Request OTP baru
  const handleResendOTP = async () => {
    setCanResend(false);
    setTimeLeft(300);
    setOtp(['', '', '', '', '', '']);
    setError('');

    try {
      // Simulasi API call untuk resend OTP
      // await resendOTPAPI.send(email);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Kode OTP baru telah dikirim ke ' + email);
    } catch (err) {
      setError('Gagal mengirim ulang kode OTP');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
              <FiCheck size={40} className="text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Email Terverifikasi!
              </h2>
              <p className="text-gray-600">
                Akun Anda telah berhasil diverifikasi. Anda akan diarahkan ke halaman login.
              </p>
            </div>

            <div className="pt-4">
              <Link 
                to="/login"
                className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
                Ke Halaman Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <GiFishingHook className="text-3xl text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Verifikasi Email
            </h2>
            <p className="text-gray-600">
              Kami telah mengirimkan kode OTP ke
            </p>
            <p className="text-gray-800 font-semibold flex items-center justify-center gap-2 mt-2">
              <FiMail size={18} className="text-blue-600" />
              {email}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="relative p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Masukkan Kode OTP
              </label>
              <div className="flex gap-2 justify-center mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    inputMode="numeric"
                  />
                ))}
              </div>
              <p className="text-center text-xs text-gray-500">
                Masukkan 6 digit kode OTP yang dikirim ke email Anda
              </p>
            </div>

            {/* OTP Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-900">Waktu berlaku kode:</p>
                <span className="text-lg font-bold text-blue-600">{formatTime(timeLeft)}</span>
              </div>
              <p className="text-xs text-blue-700">
                Kode OTP akan hangus jika tidak digunakan dalam 5 menit
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memverifikasi...
                </span>
              ) : (
                'Verifikasi Email'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Tidak menerima kode?
            </p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={!canResend}
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <FiRotateCcw size={18} />
              {canResend ? 'Kirim Ulang Kode' : `Kirim Ulang dalam ${formatTime(timeLeft)}`}
            </button>
          </div>

          {/* Change Email Link */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Email salah?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                Kembali ke registrasi
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

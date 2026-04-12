// src/components/Footer.jsx
import React from 'react';
import { GiFishingHook } from 'react-icons/gi';
import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10 max-w-none">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <GiFishingHook className="text-3xl text-blue-500" />
              <span className="text-xl font-bold text-white">Fish<span className="text-blue-500">Gear</span></span>
            </div>
            <p className="text-sm">
              Toko alat pancing terlengkap dan terpercaya. <br />
              Perlengkapan memancing berkualitas untuk pemula hingga profesional.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Tautan Cepat</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Hubungi Kami</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Ikuti Kami</h3>
            <div className="flex gap-4 text-xl">
              <a href="#" className="hover:text-blue-400 transition"><FaInstagram /></a>
              <a href="#" className="hover:text-blue-400 transition"><FaFacebook /></a>
              <a href="#" className="hover:text-blue-400 transition"><FaTwitter /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          &copy; {new Date().getFullYear()} FishGear. All rights reserved.
        </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
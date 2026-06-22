import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setIsInitializing(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('authToken');
      setToken(null);
    } finally {
      setIsInitializing(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      localStorage.setItem('authToken', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const message = err.response?.data?.message
        || (validationErrors ? Object.values(validationErrors).flat().join(' ') : null)
        || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('authToken', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.updateProfile({ name, email, password });
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const message = err.response?.data?.message
        || (validationErrors ? Object.values(validationErrors).flat().join(' ') : null)
        || 'Gagal memperbarui profil';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isInitializing, error, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

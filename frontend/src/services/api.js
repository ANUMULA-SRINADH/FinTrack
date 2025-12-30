import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
});

// This interceptor ensures the JWT token is sent with every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Export 1: Authentication ---
export const authService = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 standard
    formData.append('password', password);
    const response = await api.post('/login', formData);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },
  signup: (userData) => api.post('/signup', userData),
  forgotPassword: (email) => api.post('/forgot-password', { email }),

  // In services/api.js
  resetPassword: async (token, newPassword) => {
      return await api.post('/reset-password', { 
          token: token, 
          new_password: newPassword 
      });
  }
};

// --- Export 2: Transactions (ADD THIS PART) ---
export const transactionService = {
  getTransactions: () => api.get('/transactions'),
  addTransaction: (data) => api.post('/transactions', data),
  getDashboard: () => api.get('/dashboard'),
  // Add this line:
  deleteTransaction: (id) => api.delete(`/transactions/${id}`), 
};
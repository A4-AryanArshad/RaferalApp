import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL Configuration
// Using deployed Vercel backend
const API_BASE_URL = 'https://raferal-app-pqbq.vercel.app/api';  // Production Vercel backend

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout
});

// Add token to requests
api.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('No access token found in AsyncStorage for request:', config.url);
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Handle token expiration and retry on timeout (for Vercel cold starts)
api.interceptors.response.use(
  response => response,
  async error => {
    // Retry once on timeout (Vercel cold starts can be slow)
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.warn('Request timeout, retrying once...');
      // Don't retry automatically - let the caller handle it
    }
    
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
      } catch (e) {
        console.error('Error removing tokens:', e);
      }
    }
    return Promise.reject(error);
  },
);

export default api;



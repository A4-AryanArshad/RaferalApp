import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL Configuration
// For local development (simulator/emulator): use localhost
// For physical device on same network: use your computer's IP (e.g., http://192.168.1.100:3000/api)
// For remote testing: use your server URL (e.g., https://your-server.com/api)
// For production: use production API URL

// Get your local IP: ifconfig (Mac/Linux) or ipconfig (Windows)
// Example: const API_BASE_URL = 'http://192.168.1.100:3000/api';

// API Base URL Configuration
// For iOS Simulator: localhost works
// For Android Emulator: use 10.0.2.2 instead of localhost
// For physical device: use your computer's IP address
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Development - works for iOS Simulator
  : 'https://your-production-api.com/api'; // Production

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Increased timeout
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

// Handle token expiration
api.interceptors.response.use(
  response => response,
  async error => {
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



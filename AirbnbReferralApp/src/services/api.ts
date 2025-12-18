import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL Configuration - Hardcoded for APK distribution
// For production APK, use your server URL (replace with your actual server URL)
// Example: 'https://your-server.com/api' or 'http://your-ip:3000/api'
const API_BASE_URL = 'http://localhost:3000/api';  // TODO: Replace with your production server URL before building APK

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout (reduced from 60s)
});

// Add token to requests (only for protected endpoints)
api.interceptors.request.use(
  async config => {
    try {
      // Public endpoints don't need tokens
      const url = config.url || '';
      const isPublicEndpoint = url.includes('/listings/search') || 
                               url.includes('/listings/featured') ||
                               url.includes('/auth/');
      
      if (!isPublicEndpoint) {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          // Log for debugging (only in development)
          if (__DEV__) {
            console.log(`[API] Adding token to protected request: ${config.url}`);
          }
        } else {
          console.warn(`[API] No access token found for protected request: ${config.url}`);
          // Don't block the request, let the backend handle it
        }
      } else {
        // For public endpoints, don't add token
        if (__DEV__) {
          console.log(`[API] Public endpoint, no token needed: ${config.url}`);
        }
      }
    } catch (error) {
      console.error('[API] Error getting token:', error);
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
    // Don't clear tokens on timeout - it might be a network/server issue, not auth
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.warn('[API] Request timeout:', error.config?.url);
      // Don't clear tokens on timeout - let the caller handle it
      return Promise.reject(error);
    }
    
    // Only clear tokens on 401 (Unauthorized) - but check if it's an auth endpoint
    // Public endpoints like /listings/search might return 401 if token is invalid but sent
    // Only clear tokens for protected endpoints
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Only clear tokens for protected endpoints (not public search endpoints)
      if (!url.includes('/listings/search') && !url.includes('/listings/featured')) {
        console.warn('[API] 401 error on protected endpoint, clearing tokens:', url);
        try {
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');
        } catch (e) {
          console.error('Error removing tokens:', e);
        }
      } else {
        console.warn('[API] 401 on public endpoint (token may be invalid but request should work):', url);
      }
    }
    return Promise.reject(error);
  },
);

export default api;



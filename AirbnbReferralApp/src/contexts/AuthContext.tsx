import React, {createContext, useContext, useState, useEffect, useCallback, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authService, User} from '../services/authService';
import {setGlobalLoading} from '../store/loadingStore';
import {setGlobalUser} from '../store/authStore';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  // Removed loading and isAuthenticated from context to avoid serialization issues
  // Components should use useAuthState() hook instead
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Update global states (outside React context to avoid serialization)
  useEffect(() => {
    setGlobalLoading(loading);
  }, [loading]);
  
  useEffect(() => {
    setGlobalUser(user);
  }, [user]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          try {
            const userData = await authService.getProfile();
            setUser(userData);
          } catch (error: any) {
            // 401 is expected if token is invalid/expired - silently handle it
            if (error.response?.status === 401) {
              // Token is invalid, clear it silently
              await AsyncStorage.removeItem('accessToken');
              await AsyncStorage.removeItem('refreshToken');
            } else {
              // Other errors - log but don't crash
              console.warn('Auth init warning:', error.message || 'Failed to get profile');
              await AsyncStorage.removeItem('accessToken');
              await AsyncStorage.removeItem('refreshToken');
            }
          }
        }
      } catch (error) {
        // Only log unexpected errors
        console.warn('Auth init error:', error);
        try {
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');
        } catch (e) {
          // Ignore storage errors
        }
      } finally {
        setLoading(false);
        setGlobalLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({email, password});
    await AsyncStorage.setItem('accessToken', response.accessToken);
    await AsyncStorage.setItem('refreshToken', response.refreshToken);
    setUser(response.user);
    // isAuthenticatedState will update automatically via useEffect
  }, []);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    const response = await authService.register(data);
    await AsyncStorage.setItem('accessToken', response.accessToken);
    await AsyncStorage.setItem('refreshToken', response.refreshToken);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    setUser(null);
    // isAuthenticatedState will update automatically via useEffect
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
  }, []);

  // CRITICAL: Don't memoize context value - React Native bridge may serialize memoized values
  // Create fresh object on every render to avoid serialization issues
  // This ensures the context value is never cached/serialized by React Native
  const contextValue: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};



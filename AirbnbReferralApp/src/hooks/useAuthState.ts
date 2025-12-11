/**
 * Custom hook to get auth state without booleans in context
 * This avoids React Native bridge serialization issues on physical devices
 */
import {useState, useEffect} from 'react';
import {useAuth} from '../contexts/AuthContext';
import {getGlobalLoading, subscribeToLoading} from '../store/loadingStore';

export function useAuthState() {
  const {user} = useAuth();
  const [loadingState, setLoadingState] = useState<boolean>(getGlobalLoading());
  
  // Subscribe to loading changes
  useEffect(() => {
    const unsubscribe = subscribeToLoading((value: boolean) => {
      // Force to literal boolean primitive
      setLoadingState(value === true ? true : false);
    });
    return unsubscribe;
  }, []);
  
  // Compute isAuthenticated directly from user (no context serialization)
  // CRITICAL: Use explicit true/false, not computed values
  const hasUser = user !== null && user !== undefined;
  const isAuthenticatedValue: boolean = hasUser ? true : false;
  
  // CRITICAL: Force loading to literal boolean primitive
  const loadingValue: boolean = loadingState === true ? true : false;
  
  // Return object with literal boolean primitives
  // Do NOT use computed values in return statement
  return {
    user,
    loading: loadingValue, // Already literal boolean
    isAuthenticated: isAuthenticatedValue, // Already literal boolean
  };
}


/**
 * Global auth store - avoids React Native context serialization issues
 * Uses global variables instead of React Context for physical device compatibility
 */
import {User} from '../services/authService';

// Global state (outside React to avoid serialization)
let globalUser: User | null = null;
const userListeners = new Set<(user: User | null) => void>();

export function setGlobalUser(user: User | null) {
  globalUser = user;
  userListeners.forEach(listener => listener(user));
}

export function getGlobalUser(): User | null {
  return globalUser;
}

export function subscribeToUser(callback: (user: User | null) => void): () => void {
  userListeners.add(callback);
  // Return unsubscribe function
  return () => {
    userListeners.delete(callback);
  };
}












/**
 * Global loading store - separate from useAuthState to avoid circular dependencies
 * Circular dependencies can cause uninitialized values, leading to type errors
 */

// Global loading state (outside React to avoid serialization)
let globalLoadingState = true;
const loadingListeners = new Set<(value: boolean) => void>();

export function setGlobalLoading(value: boolean) {
  globalLoadingState = value;
  loadingListeners.forEach(listener => listener(value));
}

export function getGlobalLoading(): boolean {
  return globalLoadingState;
}

export function subscribeToLoading(callback: (value: boolean) => void): () => void {
  loadingListeners.add(callback);
  // Return unsubscribe function
  return () => {
    loadingListeners.delete(callback);
  };
}












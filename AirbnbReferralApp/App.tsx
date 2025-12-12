import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar, View, Text, StyleSheet} from 'react-native';
import {AuthProvider} from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

class ErrorBoundary extends React.Component<
  {children: React.ReactNode},
  {hasError: boolean; error: Error | null}
> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error: Error) {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  // CRITICAL: Ensure all values are primitives before passing to NavigationContainer
  // This prevents any serialization issues in React Native bridge
  try {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <StatusBar barStyle="dark-content" />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    // Fallback UI if app fails to initialize
    console.error('App initialization error:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>App Initialization Error</Text>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FF5A5F',
  },
  errorText: {
    fontSize: 14,
    color: '#717171',
    textAlign: 'center',
  },
});

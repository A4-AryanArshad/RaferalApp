import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'react-native';
import {AuthProvider} from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  // CRITICAL: Ensure all values are primitives before passing to NavigationContainer
  // This prevents any serialization issues in React Native bridge
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer independent={false}>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

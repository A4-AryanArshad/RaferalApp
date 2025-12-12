import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {getGlobalUser, subscribeToUser} from '../store/authStore';
import {User} from '../services/authService';
import {ActivityIndicator, View, Text, StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Main Screens
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReferralsScreen from '../screens/ReferralsScreen';
import RewardsScreen from '../screens/RewardsScreen';
import ListingSearchScreen from '../screens/ListingSearchScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import ReferralShareScreen from '../screens/ReferralShareScreen';
import CreateListingScreen from '../screens/CreateListingScreen';
import ReferralLandingScreen from '../screens/ReferralLandingScreen';
import ReportBookingScreen from '../screens/ReportBookingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#FF5A5F" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

const MainTabs = () => {
  return (
    <Tab.Navigator
        screenOptions={{
        tabBarActiveTintColor: '#FF5A5F',
        tabBarInactiveTintColor: '#717171',
        headerShown: true as boolean,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#222222',
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Accueil',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Listings"
        component={ListingSearchScreen}
        options={{
          title: 'Rechercher',
          tabBarLabel: 'Rechercher',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Referrals"
        component={ReferralsScreen}
        options={{
          title: 'Mes Recommandations',
          tabBarLabel: 'Recommandations',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="link" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{
          title: 'Récompenses',
          tabBarLabel: 'Récompenses',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="gift" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  // CRITICAL: Use refs instead of state to avoid React Native bridge serialization
  // Refs don't trigger re-renders through the bridge, avoiding type errors
  const userRef = React.useRef<User | null>(getGlobalUser());
  const [forceUpdate, setForceUpdate] = React.useState(0);
  const [initialLoad, setInitialLoad] = React.useState<boolean>(true);
  
  // Subscribe to global user changes - update ref, not state
  useEffect(() => {
    const unsubscribe = subscribeToUser((newUser) => {
      userRef.current = newUser;
      // Force re-render by updating counter
      setForceUpdate(prev => prev + 1);
    });
    return unsubscribe;
  }, []);
  
  // Track initial load - set to false after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Get user from ref (not state) - avoids serialization
  const user = userRef.current;
  
  // CRITICAL: Use Object.is() to ensure strict boolean primitives
  // This is the most reliable way to avoid Hermes serialization issues
  const userExists = Object.is(user, null) === false && Object.is(user, undefined) === false;
  const isAuthenticated: boolean = userExists === true ? true : false;
  
  const loading: boolean = Object.is(initialLoad, true) === true ? true : false;

  if (loading === true) {
    return <LoadingScreen />;
  }

  // CRITICAL: Ensure headerShown is literal boolean primitive
  const headerShownValue: boolean = false;
  
  // CRITICAL: Avoid ternary in JSX - use if/else to render different navigators
  // This prevents any boolean serialization issues in JSX
  
  if (isAuthenticated === false) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen
          name="ReferralLanding"
          component={ReferralLandingScreen}
          options={{
            headerShown: true as boolean,
            title: 'Recommandation',
            headerStyle: {backgroundColor: '#FF5A5F'},
            headerTintColor: '#FFFFFF',
          }}
        />
      </Stack.Navigator>
    );
  }
  
  return (
    <Stack.Navigator screenOptions={{headerShown: headerShownValue}}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="ListingDetail"
        component={ListingDetailScreen}
        options={{
          headerShown: true as boolean,
          title: 'Détails de la location',
          headerStyle: {backgroundColor: '#FFFFFF'},
          headerTintColor: '#222222',
        }}
      />
      <Stack.Screen
        name="ReferralShare"
        component={ReferralShareScreen}
        options={{
          headerShown: true as boolean,
          title: 'Partager',
          headerStyle: {backgroundColor: '#FFFFFF'},
          headerTintColor: '#222222',
        }}
      />
      <Stack.Screen
        name="CreateListing"
        component={CreateListingScreen}
        options={{
          headerShown: true as boolean,
          title: 'Créer une annonce',
          headerStyle: {backgroundColor: '#FFFFFF'},
          headerTintColor: '#222222',
        }}
      />
      <Stack.Screen
        name="ReportBooking"
        component={ReportBookingScreen}
        options={{
          headerShown: true as boolean,
          title: 'Signaler une réservation',
          headerStyle: {backgroundColor: '#FFFFFF'},
          headerTintColor: '#222222',
        }}
      />
      {/* Public screens - accessible without auth */}
      <Stack.Screen
        name="ReferralLanding"
        component={ReferralLandingScreen}
        options={{
          headerShown: true as boolean,
          title: 'Recommandation',
          headerStyle: {backgroundColor: '#FF5A5F'},
          headerTintColor: '#FFFFFF',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  loadingText: {
    marginTop: 10,
    color: '#717171',
  },
});

export default AppNavigator;


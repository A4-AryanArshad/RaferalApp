import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAuth} from '../contexts/AuthContext';
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
        headerShown: true,
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
  const {isAuthenticated, loading} = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="ListingDetail"
            component={ListingDetailScreen}
            options={{
              headerShown: true,
              title: 'Détails de la location',
              headerStyle: {backgroundColor: '#FFFFFF'},
              headerTintColor: '#222222',
            }}
          />
          <Stack.Screen
            name="ReferralShare"
            component={ReferralShareScreen}
            options={{
              headerShown: true,
              title: 'Partager',
              headerStyle: {backgroundColor: '#FFFFFF'},
              headerTintColor: '#222222',
            }}
          />
          <Stack.Screen
            name="CreateListing"
            component={CreateListingScreen}
            options={{
              headerShown: true,
              title: 'Créer une annonce',
              headerStyle: {backgroundColor: '#FFFFFF'},
              headerTintColor: '#222222',
            }}
          />
          <Stack.Screen
            name="ReportBooking"
            component={ReportBookingScreen}
            options={{
              headerShown: true,
              title: 'Signaler une réservation',
              headerStyle: {backgroundColor: '#FFFFFF'},
              headerTintColor: '#222222',
            }}
          />
        </>
      )}
      {/* Public screens - accessible without auth */}
      <Stack.Screen
        name="ReferralLanding"
        component={ReferralLandingScreen}
        options={{
          headerShown: true,
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


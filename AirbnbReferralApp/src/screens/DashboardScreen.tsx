import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuthState} from '../hooks/useAuthState';
import {referralService, ReferralStats} from '../services/referralService';
import {listingService, Listing} from '../services/listingService';
import api from '../services/api';
import {Ionicons} from '@expo/vector-icons';

interface HostDashboardStats {
  totalListings: number;
  activeListings: number;
  pendingConfirmations: number;
  confirmedBookings: number;
  rejectedBookings: number;
  totalRevenue: number;
  totalCommissionsPaid: number;
}

const DashboardScreen = () => {
  const {user, isAuthenticated} = useAuthState();
  const navigation = useNavigation();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [hostStats, setHostStats] = useState<HostDashboardStats | null>(null);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isHost = user?.role === 'host';

  const fetchStats = async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    
    // Verify token exists before making requests
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.warn('[Dashboard] No access token found, user may need to log in again');
        setLoading(false);
        setRefreshing(false);
        return;
      }
    } catch (error) {
      console.error('[Dashboard] Error checking token:', error);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    
    // Set default stats first
    if (isHost) {
      setHostStats({
        totalListings: 0,
        activeListings: 0,
        pendingConfirmations: 0,
        confirmedBookings: 0,
        rejectedBookings: 0,
        totalRevenue: 0,
        totalCommissionsPaid: 0,
      });
    } else {
      setStats({
        totalReferrals: 0,
        activeReferrals: 0,
        bookedReferrals: 0,
        completedReferrals: 0,
        totalClicks: 0,
        totalViews: 0,
      });
    }
    setFeaturedListings([]);

    try {
      if (isHost) {
        // Fetch host dashboard stats and listings in parallel for faster loading
        // Use shorter timeout for listings to prevent blocking
        const [statsResponse, listingsResponse] = await Promise.allSettled([
          api.get('/host/dashboard', { timeout: 10000 }).catch(err => {
            console.warn('[Dashboard] Stats fetch failed:', err.message);
            return { data: null };
          }),
          api.get('/host/listings', { timeout: 10000 }).catch(err => {
            console.warn('[Dashboard] Listings fetch failed:', err.message);
            return { data: null };
          }),
        ]);

        // Process stats response
        if (statsResponse.status === 'fulfilled' && statsResponse.value?.data?.stats) {
          setHostStats(statsResponse.value.data.stats);
        }

        // Process listings response (non-blocking - if it fails, just show empty)
        if (listingsResponse.status === 'fulfilled' && listingsResponse.value?.data?.listings) {
          const listings = listingsResponse.value.data.listings.map((item: any) => item.listing);
          console.log(`[Dashboard] Setting ${listings.length} listings`);
          setFeaturedListings(listings);
        } else {
          console.warn('[Dashboard] No listings available or fetch failed');
          setFeaturedListings([]);
        }
      } else {
        // Fetch user stats and listings
        try {
          const statsData = await referralService.getStats();
          setStats(statsData);
        } catch (statsError: any) {
          console.error('Failed to fetch stats:', statsError);
        }

        try {
          const listingsData = await listingService.getFeaturedListings();
          setFeaturedListings(listingsData);
        } catch (listingsError: any) {
          console.error('Failed to fetch featured listings:', listingsError);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Refresh when screen comes into focus (after creating listing, etc.)
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && user) {
        fetchStats();
      }
    }, [isAuthenticated, user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bienvenue, {user?.firstName}!</Text>
        <Text style={styles.subtitle}>
          {isHost 
            ? 'Gérez vos annonces et confirmez les réservations'
            : 'Commencez à recommander et gagnez des récompenses'}
        </Text>
      </View>

      {isHost ? (
        // Host Dashboard Stats
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="home" size={32} color="#FF5A5F" />
            <Text style={styles.statValue}>{hostStats?.totalListings || 0}</Text>
            <Text style={styles.statLabel}>Annonces</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="time" size={32} color="#FF5A5F" />
            <Text style={styles.statValue}>{hostStats?.pendingConfirmations || 0}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color="#FF5A5F" />
            <Text style={styles.statValue}>{hostStats?.confirmedBookings || 0}</Text>
            <Text style={styles.statLabel}>Confirmées</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="cash" size={32} color="#FF5A5F" />
            <Text style={styles.statValue}>${hostStats?.totalRevenue || 0}</Text>
            <Text style={styles.statLabel}>Revenus</Text>
          </View>
        </View>
      ) : (
        // User Dashboard Stats
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="link" size={32} color="#FF5A5F" />
            <Text style={styles.statValue}>{stats?.totalReferrals || 0}</Text>
            <Text style={styles.statLabel}>Recommandations</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="hand-left" size={32} color="#FF5A5F" />
            <Text style={styles.statValue}>{stats?.totalClicks || 0}</Text>
            <Text style={styles.statLabel}>Clics</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color="#FF5A5F" />
            <Text style={styles.statValue}>{stats?.bookedReferrals || 0}</Text>
            <Text style={styles.statLabel}>Réservations</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="gift" size={32} color="#FF5A5F" />
            <Text style={styles.statValue}>{stats?.completedReferrals || 0}</Text>
            <Text style={styles.statLabel}>Complétées</Text>
          </View>
        </View>
      )}

      {featuredListings.length > 0 && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isHost ? 'Mes annonces' : 'Locations populaires'}
            </Text>
            {isHost ? (
              <TouchableOpacity onPress={() => {
                // Navigate to a screen showing all host listings
                // For now, we'll use the search screen filtered to show only host's listings
                alert('Fonctionnalité à venir: Voir toutes mes annonces');
              }}>
                <Text style={styles.seeAllText}>Voir tout</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => navigation.navigate('Listings' as never)}>
                <Text style={styles.seeAllText}>Voir tout</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuredScroll}>
            {featuredListings.slice(0, 5).map(listing => (
              <TouchableOpacity
                key={listing._id}
                style={styles.featuredCard}
                onPress={() => navigation.navigate('ListingDetail', {id: listing._id} as never)}>
                {listing.images && listing.images.length > 0 ? (
                  <Image
                    source={{uri: listing.images[0]}}
                    style={styles.featuredImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.featuredNoImage}>
                    <Ionicons name="image-outline" size={30} color="#DDDDDD" />
                  </View>
                )}
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredTitle} numberOfLines={1}>
                    {listing.title}
                  </Text>
                  <Text style={styles.featuredLocation} numberOfLines={1}>
                    {listing.location.city}
                  </Text>
                  <Text style={styles.featuredPrice}>
                    {listing.currency} {listing.pricePerNight}/nuit
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {isHost ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('CreateListing' as never)}>
            <Ionicons name="add-circle" size={20} color="#FFFFFF" style={{marginRight: 8}} />
            <Text style={styles.buttonText}>Créer une annonce</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              navigation.navigate('HostConfirmations' as never)
            }>
            <Ionicons name="time" size={20} color="#222222" style={{marginRight: 8}} />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Confirmations en attente ({hostStats?.pendingConfirmations || 0})
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Listings' as never)}>
            <Ionicons name="search" size={20} color="#FFFFFF" style={{marginRight: 8}} />
            <Text style={styles.buttonText}>Parcourir toutes les locations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Referrals' as never)}>
            <Ionicons name="stats-chart" size={20} color="#222222" style={{marginRight: 8}} />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Mes recommandations
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!isHost && stats?.totalReferrals === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="rocket" size={64} color="#DDDDDD" />
          <Text style={styles.emptyTitle}>
            Commencez votre première recommandation
          </Text>
          <Text style={styles.emptyText}>
            Parcourez les locations et partagez-les avec vos amis!
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Listings' as never)}>
            <Text style={styles.emptyButtonText}>Commencer</Text>
          </TouchableOpacity>
        </View>
      )}

      {isHost && hostStats?.totalListings === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="home" size={64} color="#DDDDDD" />
          <Text style={styles.emptyTitle}>
            Créez votre première annonce
          </Text>
          <Text style={styles.emptyText}>
            Ajoutez votre propriété et commencez à recevoir des réservations!
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('CreateListing' as never)}>
            <Text style={styles.emptyButtonText}>Créer une annonce</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#717171',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#717171',
  },
  actions: {
    padding: 20,
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DDDDDD',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#222222',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    margin: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#717171',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  featuredSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF5A5F',
    fontWeight: '600',
  },
  featuredScroll: {
    paddingLeft: 20,
  },
  featuredCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F7F7F7',
  },
  featuredNoImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredContent: {
    padding: 12,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 4,
  },
  featuredLocation: {
    fontSize: 14,
    color: '#717171',
    marginBottom: 8,
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5A5F',
  },
});

export default DashboardScreen;


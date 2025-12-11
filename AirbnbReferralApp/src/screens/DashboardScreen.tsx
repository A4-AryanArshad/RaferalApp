import React, {useEffect, useState} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import {useAuthState} from '../hooks/useAuthState';
import {referralService, ReferralStats} from '../services/referralService';
import {listingService, Listing} from '../services/listingService';
import {Ionicons} from '@expo/vector-icons';

const DashboardScreen = () => {
  const {user, isAuthenticated} = useAuthState();
  const navigation = useNavigation();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    
    // Set default stats first
    setStats({
      totalReferrals: 0,
      activeReferrals: 0,
      bookedReferrals: 0,
      completedReferrals: 0,
      totalClicks: 0,
      totalViews: 0,
    });
    setFeaturedListings([]);

    try {
      // Fetch stats and listings separately to handle errors independently
      try {
        const statsData = await referralService.getStats();
        setStats(statsData);
      } catch (statsError: any) {
        console.error('Failed to fetch stats:', statsError);
        // Keep default stats
      }

      try {
        const listingsData = await listingService.getFeaturedListings();
        setFeaturedListings(listingsData);
      } catch (listingsError: any) {
        console.error('Failed to fetch featured listings:', listingsError);
        // Keep empty array
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
          Commencez à recommander et gagnez des récompenses
        </Text>
      </View>

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

      {featuredListings.length > 0 && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Locations populaires</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Listings' as never)}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
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

      {stats?.totalReferrals === 0 && (
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


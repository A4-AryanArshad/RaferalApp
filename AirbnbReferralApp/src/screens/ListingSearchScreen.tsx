import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {referralService} from '../services/referralService';
import {listingService, Listing} from '../services/listingService';
import {Ionicons} from '@expo/vector-icons';

const ListingSearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchListings = async () => {
    try {
      const params: any = {
        limit: 50, // Load more listings
      };
      if (searchQuery) {
        params.city = searchQuery;
      }
      // If no search query, fetch all active listings
      const data = await listingService.searchListings(params);
      setListings(data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      Alert.alert('Erreur', 'Impossible de charger les annonces');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const handleSearch = () => {
    setLoading(true);
    fetchListings();
  };

  const handleGenerateReferral = async (listingId: string) => {
    try {
      const referral = await referralService.createReferral({listingId});
      navigation.navigate('ReferralShare', {referralId: referral._id} as never);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.error || 'Erreur lors de la création du lien');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une destination..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateListing' as never)}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF5A5F" />
        </View>
      ) : (
        <ScrollView
          style={styles.listingsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {listings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="home-outline" size={64} color="#DDDDDD" />
              <Text style={styles.emptyTitle}>Aucune location trouvée</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'Essayez une autre recherche'
                  : 'Créez votre première annonce!'}
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('CreateListing' as never)}>
                <Text style={styles.emptyButtonText}>Créer une annonce</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {searchQuery ? 'Résultats de recherche' : 'Toutes les locations'}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {listings.length} {listings.length === 1 ? 'annonce disponible' : 'annonces disponibles'}
                </Text>
              </View>
              {listings.map(listing => (
                <TouchableOpacity
                  key={listing._id}
                  style={styles.listingCard}
                  onPress={() => navigation.navigate('ListingDetail', {id: listing._id} as never)}>
                  {listing.images && listing.images.length > 0 && listing.images[0] && listing.images[0].trim() !== '' ? (
                    <Image
                      source={{uri: listing.images[0]}}
                      style={styles.listingImage}
                      resizeMode="cover"
                      onError={(error) => {
                        console.log('Image load error:', error.nativeEvent.error);
                      }}
                    />
                  ) : (
                    <View style={styles.noImageContainer}>
                      <Ionicons name="image-outline" size={40} color="#DDDDDD" />
                    </View>
                  )}
                  <View style={styles.listingContent}>
                    <Text style={styles.listingTitle} numberOfLines={1}>
                      {listing.title}
                    </Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={14} color="#717171" />
                      <Text style={styles.listingLocation}>
                        {listing.location.city}, {listing.location.country}
                      </Text>
                    </View>
                    <View style={styles.listingFooter}>
                      <View style={styles.priceSection}>
                        <Text style={styles.listingPrice}>
                          {listing.currency} {listing.pricePerNight}
                        </Text>
                        <Text style={styles.priceLabel}>/nuit</Text>
                        {listing.rating && (
                          <View style={styles.ratingRow}>
                            <Ionicons name="star" size={12} color="#FFB400" />
                            <Text style={styles.listingRating}>
                              {listing.rating} ({listing.reviewCount || 0})
                            </Text>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.recommendButton}
                        onPress={e => {
                          e.stopPropagation();
                          handleGenerateReferral(listing._id);
                        }}>
                        <Ionicons name="share" size={16} color="#FFFFFF" />
                        <Text style={styles.recommendButtonText}>Partager</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
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
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  searchBar: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  searchButtonText: {
    fontSize: 20,
  },
  listingsContainer: {
    flex: 1,
  },
  sectionHeader: {
    padding: 15,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#717171',
  },
  listingCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 0,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listingImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F7F7F7',
  },
  noImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingContent: {
    padding: 15,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  listingLocation: {
    fontSize: 14,
    color: '#717171',
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 5,
  },
  priceSection: {
    flex: 1,
  },
  listingPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
  },
  priceLabel: {
    fontSize: 14,
    color: '#717171',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  listingRating: {
    fontSize: 12,
    color: '#717171',
  },
  recommendButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recommendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    padding: 10,
    gap: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
    marginTop: 16,
    marginBottom: 8,
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
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ListingSearchScreen;


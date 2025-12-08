import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {Linking} from 'react-native';
import {referralService} from '../services/referralService';
import {listingService, Listing} from '../services/listingService';
import {Ionicons} from '@expo/vector-icons';
import {useAuth} from '../contexts/AuthContext';

const {width} = Dimensions.get('window');

const ListingDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {isAuthenticated, user} = useAuth();
  const {id} = route.params as {id: string};
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await listingService.getListing(id);
        setListing(data);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de charger les détails');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigation]);

  const handleGenerateReferral = async () => {
    if (!listing) return;
    
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      Alert.alert(
        'Authentification requise',
        'Vous devez être connecté pour créer un lien de recommandation.',
        [
          {text: 'Annuler', style: 'cancel'},
          {
            text: 'Se connecter',
            onPress: () => navigation.navigate('Login' as never),
          },
        ]
      );
      return;
    }
    
    setGenerating(true);
    try {
      // Create referral without baseUrl - backend will use default
      const referral = await referralService.createReferral({
        listingId: listing._id,
        // baseUrl is optional - backend will use default
      });
      navigation.navigate('ReferralShare', {referralId: referral._id} as never);
    } catch (error: any) {
      console.error('Error creating referral:', error);
      
      // Handle 401 specifically
      if (error.response?.status === 401) {
        Alert.alert(
          'Session expirée',
          'Votre session a expiré. Veuillez vous reconnecter.',
          [
            {text: 'OK', onPress: () => navigation.navigate('Login' as never)},
          ]
        );
        return;
      }
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.errors?.map((e: any) => e.msg || e.msg).join(', ') ||
                          error.message || 
                          'Erreur lors de la création du lien';
      Alert.alert('Erreur', errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenAirbnb = async () => {
    if (!listing?.airbnbListingUrl) return;
    const url = listing.airbnbListingUrl;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le lien Airbnb');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.center}>
        <Text>Listing not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {listing.images && listing.images.length > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageCarousel}>
          {listing.images.map((imageUri, index) => (
            <Image
              key={index}
              source={{uri: imageUri}}
              style={styles.listingImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.location}>
          <Ionicons name="location" size={16} color="#717171" /> {listing.location.city},{' '}
          {listing.location.country}
        </Text>
        {listing.rating && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFB400" />
            <Text style={styles.rating}>{listing.rating}</Text>
            <Text style={styles.reviews}>({listing.reviewCount || 0} avis)</Text>
          </View>
        )}
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.price}>
          {listing.currency} {listing.pricePerNight} / nuit
        </Text>
        
        {listing.airbnbListingUrl && (
          <TouchableOpacity
            style={styles.airbnbButton}
            onPress={handleOpenAirbnb}>
            <Ionicons name="home" size={20} color="#FF5A5F" />
            <Text style={styles.airbnbButtonText}>Voir sur Airbnb</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, generating && styles.buttonDisabled]}
          onPress={handleGenerateReferral}
          disabled={generating}>
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Créer un lien de recommandation</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{listing.description}</Text>
      </View>

      {listing.amenities && listing.amenities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Équipements</Text>
          {listing.amenities.map((amenity, idx) => (
            <View key={idx} style={styles.amenityItem}>
              <Ionicons name="checkmark-circle" size={16} color="#00A699" />
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
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
  imageCarousel: {
    height: 250,
    backgroundColor: '#DDDDDD',
  },
  listingImage: {
    width: width,
    height: 250,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#717171',
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
  },
  reviews: {
    fontSize: 14,
    color: '#717171',
  },
  priceSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF5A5F',
    marginBottom: 15,
  },
  airbnbButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FF5A5F',
    gap: 8,
  },
  airbnbButtonText: {
    color: '#FF5A5F',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#717171',
    lineHeight: 24,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  amenityText: {
    fontSize: 16,
    color: '#222222',
  },
});

export default ListingDetailScreen;


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
  Linking,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {listingService, Listing} from '../services/listingService';
import {referralService} from '../services/referralService';
import {Ionicons} from '@expo/vector-icons';
import api from '../services/api';

interface ReferralInfo {
  _id: string;
  referralCode: string;
  referralLink: string;
  listing?: Listing;
  clickCount: number;
  viewCount: number;
}

const ReferralLandingScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const code = (route.params as {code?: string})?.code;
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingClick, setTrackingClick] = useState(false);

  useEffect(() => {
    const fetchReferral = async () => {
      if (!code) {
        setLoading(false);
        return;
      }

      try {
        // This endpoint automatically tracks the view
        const response = await api.get(`/referrals/code/${code}`);
        setReferral(response.data.referral);
      } catch (error: any) {
        console.error('Failed to fetch referral:', error);
        setLoading(false);
      }
    };

    fetchReferral();
  }, [code]);

  const handleViewListing = async () => {
    if (!referral?.listing) return;

    setTrackingClick(true);
    try {
      // Track click when user views listing
      await referralService.trackClick(referral.referralCode);
      
      navigation.navigate('ListingDetail', {id: referral.listing._id} as never);
    } catch (error) {
      // Still navigate even if tracking fails
      navigation.navigate('ListingDetail', {id: referral.listing._id} as never);
    } finally {
      setTrackingClick(false);
    }
  };

  const handleOpenAirbnb = async () => {
    if (!referral?.listing?.airbnbListingUrl) return;
    
    setTrackingClick(true);
    try {
      await referralService.trackClick(referral.referralCode);
      const url = referral.listing.airbnbListingUrl;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir le lien Airbnb');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
    } finally {
      setTrackingClick(false);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Navigate to login if no back stack
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!code) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle" size={64} color="#DDDDDD" />
        <Text style={styles.errorText}>Code de recommandation manquant</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!referral || !referral.listing) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle" size={64} color="#DDDDDD" />
        <Text style={styles.errorText}>Annonce non trouvée</Text>
        <Text style={styles.errorSubtext}>
          Le code de recommandation est invalide ou l'annonce n'existe plus.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const listing = referral.listing;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recommandation spéciale</Text>
        <Text style={styles.headerSubtitle}>
          Découvrez cette location recommandée pour vous
        </Text>
      </View>

      {listing.images && listing.images.length > 0 && (
        <Image
          source={{uri: listing.images[0]}}
          style={styles.heroImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <Text style={styles.listingTitle}>{listing.title}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color="#717171" />
          <Text style={styles.location}>
            {listing.location.city}, {listing.location.country}
          </Text>
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.price}>
            {listing.currency} {listing.pricePerNight}
          </Text>
          <Text style={styles.priceLabel}>/ nuit</Text>
        </View>

        {listing.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>
        )}

        {listing.amenities && listing.amenities.length > 0 && (
          <View style={styles.amenitiesSection}>
            <Text style={styles.sectionTitle}>Équipements</Text>
            {listing.amenities.map((amenity, idx) => (
              <View key={idx} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#00A699" />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          {listing.airbnbListingUrl && (
            <TouchableOpacity
              style={styles.airbnbButton}
              onPress={handleOpenAirbnb}
              disabled={trackingClick}>
              {trackingClick ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="home" size={20} color="#FFFFFF" />
                  <Text style={styles.airbnbButtonText}>Réserver sur Airbnb</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.viewButton}
            onPress={handleViewListing}
            disabled={trackingClick}>
            {trackingClick ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="eye" size={20} color="#FFFFFF" />
                <Text style={styles.viewButtonText}>Voir les détails</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.referralInfo}>
          <Text style={styles.referralInfoText}>
            Code de recommandation: {referral.referralCode}
          </Text>
        </View>
      </View>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#717171',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#717171',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  backButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FF5A5F',
    padding: 30,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  heroImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#DDDDDD',
  },
  content: {
    padding: 20,
  },
  listingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  location: {
    fontSize: 16,
    color: '#717171',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF5A5F',
  },
  priceLabel: {
    fontSize: 16,
    color: '#717171',
    marginLeft: 4,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#717171',
    lineHeight: 24,
  },
  amenitiesSection: {
    marginBottom: 24,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  amenityText: {
    fontSize: 16,
    color: '#222222',
  },
  actions: {
    gap: 12,
    marginBottom: 20,
  },
  airbnbButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  airbnbButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  referralInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  referralInfoText: {
    fontSize: 12,
    color: '#717171',
  },
});

export default ReferralLandingScreen;


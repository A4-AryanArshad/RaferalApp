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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {Linking} from 'react-native';
import {referralService, Referral} from '../services/referralService';
import {listingService, Listing} from '../services/listingService';
import {Ionicons} from '@expo/vector-icons';
import {useAuthState} from '../hooks/useAuthState';
import {useAuth} from '../contexts/AuthContext';
import * as Clipboard from 'expo-clipboard';
import api from '../services/api';

const {width} = Dimensions.get('window');

const ListingDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {user, isAuthenticated} = useAuthState();
  const {logout} = useAuth();
  const {id} = route.params as {id: string};
  const [listing, setListing] = useState<Listing | null>(null);
  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    guestEmail: '',
    checkIn: '',
    checkOut: '',
    bookingConfirmation: '',
  });

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

  useEffect(() => {
    const fetchReferral = async () => {
      if (!listing || !isAuthenticated || !user || !user._id) {
        console.log('Skipping referral fetch:', {
          hasListing: !!listing,
          isAuthenticated,
          hasUser: !!user,
          userId: user?._id,
        });
        return;
      }
      
      // Validate that user._id is a string (MongoDB ObjectId format)
      if (typeof user._id !== 'string' || user._id.trim() === '') {
        console.error('Invalid user._id format:', user._id);
        return;
      }
      
      setLoadingReferral(true);
      try {
        console.log('Fetching referrals for user:', user._id);
        // Get all user referrals and find the one for this listing
        // Use user._id instead of user.userId (User interface has _id, not userId)
        const referrals = await referralService.getUserReferrals(user._id);
        console.log('Referrals fetched:', referrals.length);
        const listingReferral = referrals.find(r => r.listingId === listing._id);
        if (listingReferral) {
          console.log('Found referral for listing:', listingReferral.referralCode);
          setReferral(listingReferral);
        } else {
          console.log('No referral found for listing:', listing._id);
        }
      } catch (error: any) {
        console.error('Error fetching referral:', error);
        // Log more details for debugging
        if (error.response) {
          console.error('Error status:', error.response.status);
          console.error('Error data:', error.response.data);
          console.error('Request URL:', error.config?.url);
          console.error('User ID used:', user._id);
        } else {
          console.error('Error message:', error.message);
        }
        // Don't show error to user, just silently fail
      } finally {
        setLoadingReferral(false);
      }
    };

    fetchReferral();
  }, [listing, isAuthenticated, user]);

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
            onPress: async () => {
              // Logout will automatically show the Login screen
              await logout();
            },
          },
        ]
      );
      return;
    }
    
    setGenerating(true);
    try {
      // Check if referral already exists, otherwise create one
      let referralToUse = referral;
      
      if (!referralToUse) {
        // Create referral without baseUrl - backend will use default
        referralToUse = await referralService.createReferral({
          listingId: listing._id,
          // baseUrl is optional - backend will use default
        });
      }
      
      // Navigate directly to ReferralShare screen
      if (referralToUse?._id) {
        navigation.navigate('ReferralShare', {referralId: referralToUse._id} as never);
      } else {
        Alert.alert('Erreur', 'Impossible de créer le lien de recommandation');
      }
    } catch (error: any) {
      console.error('Error creating referral:', error);
      
      // Handle 401 specifically
      if (error.response?.status === 401) {
        Alert.alert(
          'Session expirée',
          'Votre session a expiré. Veuillez vous reconnecter.',
          [
            {
              text: 'OK',
              onPress: async () => {
                // Logout will automatically show the Login screen
                await logout();
              },
            },
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

  const copyUserLink = async () => {
    if (!listing?.airbnbListingUrl) return;
    await Clipboard.setStringAsync(listing.airbnbListingUrl);
    Alert.alert('Copié!', 'Lien copié dans le presse-papiers');
  };

  const handleBookingFormChange = (field: string, value: string) => {
    setBookingFormData({...bookingFormData, [field]: value});
  };

  const handleSubmitBooking = async () => {
    if (!referral) return;

    if (
      !bookingFormData.guestEmail ||
      !bookingFormData.checkIn ||
      !bookingFormData.checkOut
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingFormData.guestEmail)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    // Validate dates
    const checkIn = new Date(bookingFormData.checkIn);
    const checkOut = new Date(bookingFormData.checkOut);
    if (checkIn >= checkOut) {
      Alert.alert('Erreur', 'La date de départ doit être après la date d\'arrivée');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour signaler une réservation',
        [
          {text: 'Annuler', style: 'cancel'},
          {
            text: 'Se connecter',
            onPress: async () => {
              await logout();
            },
          },
        ],
      );
      return;
    }

    setSubmittingBooking(true);
    try {
      await api.post('/referrals/track-booking', {
        referralCode: referral.referralCode,
        guestEmail: bookingFormData.guestEmail,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        bookingConfirmation: bookingFormData.bookingConfirmation || undefined,
        reportedBy: 'guest',
      });

      Alert.alert(
        'Succès',
        'Réservation signalée avec succès! Le propriétaire va confirmer votre réservation.',
      );
      
      // Reset form
      setBookingFormData({
        guestEmail: '',
        checkIn: '',
        checkOut: '',
        bookingConfirmation: '',
      });
    } catch (error: any) {
      let errorMessage = 'Échec du signalement de la réservation';
      if (error.response?.data) {
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors
            .map((err: any) => err.msg || err.message || err)
            .join('\n');
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      Alert.alert('Erreur', errorMessage);
    } finally {
      setSubmittingBooking(false);
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
      {listing.images && listing.images.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageCarousel}>
          {listing.images.map((imageUri, index) => {
            // Filter out empty or invalid URIs
            if (!imageUri || imageUri.trim() === '') return null;
            
            return (
              <View key={index} style={styles.imageContainer}>
                <Image
                  source={{uri: imageUri}}
                  style={styles.listingImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.log('Image load error:', error.nativeEvent.error, 'URI:', imageUri);
                  }}
                />
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.imageCarousel}>
          <View style={styles.noImageContainer}>
            <Ionicons name="image-outline" size={60} color="#DDDDDD" />
            <Text style={styles.noImageText}>Aucune image disponible</Text>
          </View>
        </View>
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
          onPress={referral ? () => navigation.navigate('ReferralShare', {referralId: referral._id} as never) : handleGenerateReferral}
          disabled={generating}>
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {referral ? 'Partager le lien' : 'Créer un lien de recommandation'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {referral && (
        <View style={styles.referralSection}>
          <Text style={styles.referralCodeLabel}>Code de recommandation:</Text>
          <Text style={styles.referralCodeValue}>{referral.referralCode}</Text>

          {listing.airbnbListingUrl && (
            <View style={styles.linkSection}>
              <Text style={styles.linkLabel}>Lien de partage:</Text>
              <View style={styles.linkContainer}>
                <Text style={styles.linkText} numberOfLines={1}>
                  {listing.airbnbListingUrl}
                </Text>
                <TouchableOpacity style={styles.copyButton} onPress={copyUserLink}>
                  <Ionicons name="copy" size={16} color="#FFFFFF" style={{marginRight: 5}} />
                  <Text style={styles.copyButtonText}>Copier</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.bookingFormSection}>
            <Text style={styles.bookingFormTitle}>Signaler une réservation</Text>
            <Text style={styles.bookingFormSubtitle}>
              Si quelqu'un a réservé via votre lien, signalez-le ici
            </Text>

            <Text style={styles.formLabel}>Email du voyageur *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="voyageur@example.com"
              value={bookingFormData.guestEmail}
              onChangeText={value => handleBookingFormChange('guestEmail', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!submittingBooking}
              placeholderTextColor="#999"
            />

            <Text style={styles.formLabel}>Date d'arrivée *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="YYYY-MM-DD (ex: 2024-06-15)"
              value={bookingFormData.checkIn}
              onChangeText={value => handleBookingFormChange('checkIn', value)}
              editable={!submittingBooking}
              placeholderTextColor="#999"
            />
            <Text style={styles.formHint}>Format: AAAA-MM-JJ</Text>

            <Text style={styles.formLabel}>Date de départ *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="YYYY-MM-DD (ex: 2024-06-20)"
              value={bookingFormData.checkOut}
              onChangeText={value => handleBookingFormChange('checkOut', value)}
              editable={!submittingBooking}
              placeholderTextColor="#999"
            />
            <Text style={styles.formHint}>Format: AAAA-MM-JJ</Text>

            <Text style={styles.formLabel}>Numéro de confirmation (optionnel)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Numéro de confirmation Airbnb"
              value={bookingFormData.bookingConfirmation}
              onChangeText={value => handleBookingFormChange('bookingConfirmation', value)}
              editable={!submittingBooking}
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={[styles.submitBookingButton, submittingBooking && styles.buttonDisabled]}
              onPress={handleSubmitBooking}
              disabled={submittingBooking}>
              {submittingBooking ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBookingButtonText}>Signaler la réservation</Text>
              )}
            </TouchableOpacity>

            <View style={styles.bookingInfoBox}>
              <Ionicons name="information-circle" size={16} color="#FF5A5F" />
              <Text style={styles.bookingInfoText}>
                Après le signalement, le propriétaire confirmera votre réservation. Une fois
                confirmée, les récompenses seront attribuées.
              </Text>
            </View>
          </View>
        </View>
      )}

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
  imageContainer: {
    width: width,
    height: 250,
  },
  listingImage: {
    width: width,
    height: 250,
  },
  noImageContainer: {
    width: width,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  noImageText: {
    marginTop: 10,
    color: '#999999',
    fontSize: 14,
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
  referralSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  referralCodeLabel: {
    fontSize: 14,
    color: '#717171',
    marginBottom: 8,
    textAlign: 'center',
  },
  referralCodeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF5A5F',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 20,
  },
  linkSection: {
    marginBottom: 10,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkText: {
    flex: 1,
    fontSize: 12,
    color: '#717171',
    backgroundColor: '#F7F7F7',
    padding: 10,
    borderRadius: 8,
  },
  copyButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bookingFormSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
  },
  bookingFormTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 5,
  },
  bookingFormSubtitle: {
    fontSize: 14,
    color: '#717171',
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 8,
    marginTop: 12,
  },
  formInput: {
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    color: '#222222',
  },
  formHint: {
    fontSize: 12,
    color: '#717171',
    marginTop: 4,
    marginBottom: 4,
  },
  submitBookingButton: {
    backgroundColor: '#00A699',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  submitBookingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bookingInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    gap: 8,
  },
  bookingInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#717171',
    lineHeight: 18,
  },
});

export default ListingDetailScreen;


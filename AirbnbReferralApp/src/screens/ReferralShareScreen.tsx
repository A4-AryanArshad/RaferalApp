import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {referralService, Referral} from '../services/referralService';
import {listingService, Listing} from '../services/listingService';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import {Ionicons} from '@expo/vector-icons';

const ReferralShareScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {referralId} = route.params as {referralId: string};
  const [referral, setReferral] = useState<Referral | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [listingLoading, setListingLoading] = useState(false);

  useEffect(() => {
    const fetchReferral = async () => {
      if (!referralId) {
        setLoading(false);
        Alert.alert('Erreur', 'ID de recommandation manquant');
        return;
      }
      try {
        const data = await referralService.getReferral(referralId);
        setReferral(data);
        
        // Fetch listing if listingId exists
        if (data.listingId) {
          setListingLoading(true);
          try {
            const listingData = await listingService.getListing(data.listingId);
            console.log('Listing fetched:', listingData);
            console.log('Airbnb URL:', listingData.airbnbListingUrl);
            setListing(listingData);
          } catch (error: any) {
            console.error('Error fetching listing:', error);
            console.error('Error details:', error.response?.data || error.message);
            setListing(null);
            // Don't show error, just continue without listing
          } finally {
            setListingLoading(false);
          }
        } else {
          console.log('No listingId in referral');
          setListingLoading(false);
        }
      } catch (error: any) {
        console.error('Error fetching referral:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Erreur lors du chargement du lien';
        Alert.alert('Erreur', errorMessage);
        // Navigate back if we can't load the referral
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReferral();
  }, [referralId, navigation]);

  const copyToClipboard = async () => {
    // Only copy the user-entered link, not the generated referral link
    if (listing?.airbnbListingUrl) {
      await Clipboard.setStringAsync(listing.airbnbListingUrl);
      Alert.alert('Copié!', 'Lien copié dans le presse-papiers');
    } else {
      Alert.alert('Erreur', 'Aucun lien à copier');
    }
  };

  const handleShare = async (method: string) => {
    if (!referral) return;

    // Only share the user-entered link, not the generated referral link
    if (!listing?.airbnbListingUrl) {
      Alert.alert('Erreur', 'Aucun lien à partager');
      return;
    }

    try {
      if (method === 'copy') {
        await copyToClipboard();
      } else {
        // For Expo, we'll use the native share sheet
        if (await Sharing.isAvailableAsync()) {
          // Note: Sharing requires a file, so we'll just copy for now
          await copyToClipboard();
          Alert.alert('Lien copié!', 'Vous pouvez maintenant le partager');
        } else {
          await copyToClipboard();
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Erreur', 'Impossible de partager');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  if (!referral) {
    return (
      <View style={styles.center}>
        <Text>Referral not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.codeLabel}>Code de recommandation:</Text>
        <Text style={styles.codeValue}>{referral.referralCode}</Text>

        <View style={styles.linkSection}>
          <Text style={styles.linkLabel}>Lien de partage:</Text>
          {listingLoading ? (
            <View style={styles.linkContainer}>
              <ActivityIndicator size="small" color="#FF5A5F" />
              <Text style={styles.loadingText}>Chargement du lien...</Text>
            </View>
          ) : listing?.airbnbListingUrl ? (
            <View style={styles.linkContainer}>
              <Text style={styles.linkText} numberOfLines={1}>
                {listing.airbnbListingUrl}
              </Text>
              <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                <Ionicons name="copy" size={16} color="#FFFFFF" style={{marginRight: 5}} />
                <Text style={styles.copyButtonText}>Copier</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.noLinkText}>
              Aucun lien Airbnb n'a été fourni pour cette annonce
            </Text>
          )}
        </View>
      </View>

      <View style={styles.shareSection}>
        <Text style={styles.shareTitle}>Partager via:</Text>
        <View style={styles.shareButtons}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare('copy')}>
            <Ionicons name="copy" size={32} color="#FF5A5F" />
            <Text style={styles.shareName}>Copier</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare('native')}>
            <Ionicons name="share" size={32} color="#FF5A5F" />
            <Text style={styles.shareName}>Partager</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Comment ça marche?</Text>
        <View style={styles.infoItem}>
          <Ionicons name="link" size={20} color="#FF5A5F" />
          <Text style={styles.infoText}>
            Partagez ce lien avec vos amis et famille
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="eye" size={20} color="#FF5A5F" />
          <Text style={styles.infoText}>
            Les vues et clics sont automatiquement suivis
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="calendar" size={20} color="#FF5A5F" />
          <Text style={styles.infoText}>
            Quand quelqu'un réserve, signalez-le pour gagner des récompenses
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.reportButton}
        onPress={() =>
          navigation.navigate('ReportBooking', {referralCode: referral.referralCode} as never)
        }>
        <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
        <Text style={styles.reportButtonText}>Signaler une réservation</Text>
      </TouchableOpacity>
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
  card: {
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
  codeLabel: {
    fontSize: 14,
    color: '#717171',
    marginBottom: 8,
    textAlign: 'center',
  },
  codeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF5A5F',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 20,
  },
  linkSection: {
    marginBottom: 20,
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
  noLinkText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
    padding: 10,
  },
  loadingText: {
    fontSize: 12,
    color: '#717171',
    marginLeft: 10,
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
  shareSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 15,
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 15,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DDDDDD',
  },
  shareName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#717171',
    lineHeight: 20,
  },
  reportButton: {
    backgroundColor: '#00A699',
    borderRadius: 8,
    padding: 16,
    margin: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReferralShareScreen;


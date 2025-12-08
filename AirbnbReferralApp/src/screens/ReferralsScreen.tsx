import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../contexts/AuthContext';
import {referralService, Referral} from '../services/referralService';
import * as Clipboard from 'expo-clipboard';
import {Ionicons} from '@expo/vector-icons';

const ReferralsScreen = () => {
  const {user} = useAuth();
  const navigation = useNavigation();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const fetchReferrals = async () => {
    if (!user?._id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const status = filter === 'all' ? undefined : filter;
      const data = await referralService.getUserReferrals(user._id, status);
      setReferrals(data || []);
    } catch (error: any) {
      console.error('Failed to fetch referrals:', error);
      // Set empty array on error instead of crashing
      setReferrals([]);
      // Only show alert for non-404 errors (404 means no referrals, which is fine)
      if (error.response?.status !== 404) {
        // Silently handle - empty state will show
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [filter, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReferrals();
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copié!', 'Lien copié dans le presse-papiers');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, {label: string; color: string}> = {
      active: {label: 'Actif', color: '#2E7D32'},
      booked: {label: 'Réservé', color: '#E65100'},
      completed: {label: 'Complété', color: '#1565C0'},
      expired: {label: 'Expiré', color: '#C2185B'},
    };
    const statusInfo = statusMap[status] || {label: status, color: '#717171'};
    return (
      <View style={[styles.statusBadge, {backgroundColor: statusInfo.color + '20'}]}>
        <Text style={[styles.statusText, {color: statusInfo.color}]}>
          {statusInfo.label}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'active', 'booked', 'completed'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterTab,
                filter === status && styles.filterTabActive,
              ]}
              onPress={() => setFilter(status)}>
              <Text
                style={[
                  styles.filterText,
                  filter === status && styles.filterTextActive,
                ]}>
                {status === 'all' ? 'Tous' : status === 'active' ? 'Actifs' : status === 'booked' ? 'Réservés' : 'Complétés'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {referrals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="link-outline" size={64} color="#DDDDDD" />
            <Text style={styles.emptyTitle}>Aucune recommandation</Text>
            <Text style={styles.emptyText}>
              Commencez à partager des locations avec vos amis!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Listings' as never)}>
              <Text style={styles.emptyButtonText}>
                Créer une recommandation
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          referrals.map(referral => (
            <View key={referral._id} style={styles.referralCard}>
              <View style={styles.referralHeader}>
                <Text style={styles.referralCode}>
                  Code: {referral.referralCode}
                </Text>
                {getStatusBadge(referral.status)}
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Clics</Text>
                  <Text style={styles.statValue}>{referral.clickCount}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Vues</Text>
                  <Text style={styles.statValue}>{referral.viewCount}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={() =>
                  navigation.navigate('ReferralShare', {referralId: referral._id} as never)
                }>
                <Text style={styles.shareButtonText}>Partager</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
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
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
  },
  filterTabActive: {
    backgroundColor: '#FF5A5F',
  },
  filterText: {
    fontSize: 14,
    color: '#717171',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  referralCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  referralHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  referralCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
    paddingVertical: 10,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#717171',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
  },
  shareButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  shareButtonText: {
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

export default ReferralsScreen;


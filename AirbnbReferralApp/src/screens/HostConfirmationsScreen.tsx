import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {hostService, PendingConfirmation} from '../services/hostService';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

const HostConfirmationsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<PendingConfirmation[]>([]);
  const navigation = useNavigation();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await hostService.getPendingConfirmations({limit: 50});
      setItems(data);
    } catch (error: any) {
      console.error('[HostConfirmations] Failed to load confirmations:', error);
      Alert.alert(
        'Erreur',
        "Impossible de charger les confirmations en attente. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleConfirm = async (item: PendingConfirmation) => {
    try {
      console.log('[HostConfirmations] Confirming', item._id);
      await hostService.confirmBooking(item._id);
      console.log('[HostConfirmations] Confirm success, removing item');
      Alert.alert('Succès', 'Réservation confirmée.');
      setItems(prev => prev.filter(i => i._id !== item._id));
    } catch (error: any) {
      console.error(
        '[HostConfirmations] Confirm error:',
        error?.response?.data || error?.message || error,
      );
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        "Impossible de confirmer cette réservation.";
      Alert.alert('Erreur', msg);
    }
  };

  const handleReject = async (item: PendingConfirmation) => {
    Alert.alert(
      'Rejeter la réservation',
      'Êtes-vous sûr de vouloir rejeter cette réservation ?',
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Rejeter',
          style: 'destructive',
          onPress: async () => {
            try {
              await hostService.rejectBooking(item._id);
              Alert.alert('Succès', 'Réservation rejetée.');
              setItems(prev => prev.filter(i => i._id !== item._id));
            } catch (error: any) {
              console.error('[HostConfirmations] Reject error:', error);
              Alert.alert('Erreur', "Impossible de rejeter cette réservation.");
            }
          },
        },
      ],
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : undefined}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#DDDDDD" />
            <Text style={styles.emptyTitle}>Aucune confirmation en attente</Text>
            <Text style={styles.emptyText}>
              Les réservations signalées par les voyageurs apparaîtront ici pour que
              vous puissiez les confirmer ou les rejeter.
            </Text>
          </View>
        ) : (
          items.map(item => (
            <View key={item._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.code}>{item.referralCode}</Text>
                <Text style={styles.date}>
                  Créé le {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="person" size={16} color="#717171" />
                <Text style={styles.text}>{item.guestEmail}</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="calendar" size={16} color="#717171" />
                <Text style={styles.text}>
                  {new Date(item.bookingDates.checkIn).toLocaleDateString()} →{' '}
                  {new Date(item.bookingDates.checkOut).toLocaleDateString()}
                </Text>
              </View>
              {item.listingId && (
                <View style={styles.row}>
                  <Ionicons name="home" size={16} color="#717171" />
                  <Text style={styles.text}>
                    {item.listingId.title}
                    {item.listingId.location?.city
                      ? ` · ${item.listingId.location.city}`
                      : ''}
                  </Text>
                </View>
              )}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(item)}>
                  <Text style={styles.rejectText}>Rejeter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.confirmButton]}
                  onPress={() => handleConfirm(item)}>
                  <Text style={styles.confirmText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
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
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#717171',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  code: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222222',
  },
  date: {
    fontSize: 12,
    color: '#717171',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  text: {
    fontSize: 14,
    color: '#222222',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: '#FF5A5F',
  },
  rejectButton: {
    backgroundColor: '#EEEEEE',
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  rejectText: {
    color: '#222222',
    fontWeight: '600',
  },
});

export default HostConfirmationsScreen;



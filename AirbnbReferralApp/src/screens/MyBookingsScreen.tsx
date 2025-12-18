import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {referralService} from '../services/referralService';

type BookingStatus =
  | 'all'
  | 'pending_host_confirmation'
  | 'host_confirmed'
  | 'host_rejected';

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const status =
        statusFilter === 'all' ? undefined : statusFilter;
      const data = await referralService.getMyBookings(status as any);
      setBookings(data || []);
    } catch (error) {
      console.error('[MyBookings] Failed to load bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_host_confirmation':
        return 'En attente';
      case 'host_confirmed':
        return 'Confirmée';
      case 'host_rejected':
        return 'Rejetée';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_host_confirmation':
        return '#E65100';
      case 'host_confirmed':
        return '#2E7D32';
      case 'host_rejected':
        return '#C2185B';
      default:
        return '#717171';
    }
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
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}>
        {[
          {key: 'all', label: 'Toutes'},
          {key: 'pending_host_confirmation', label: 'En attente'},
          {key: 'host_confirmed', label: 'Acceptées'},
          {key: 'host_rejected', label: 'Rejetées'},
        ].map(tab => (
          <View
            key={tab.key}
            style={[
              styles.filterTab,
              statusFilter === tab.key && styles.filterTabActive,
            ]}>
            <Text
              style={[
                styles.filterText,
                statusFilter === tab.key && styles.filterTextActive,
              ]}
              onPress={() =>
                setStatusFilter(tab.key as BookingStatus)
              }>
              {tab.label}
            </Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#DDDDDD" />
            <Text style={styles.emptyTitle}>Aucune réservation</Text>
            <Text style={styles.emptyText}>
              Vos réservations signalées apparaîtront ici une fois envoyées.
            </Text>
          </View>
        ) : (
          bookings.map(item => (
            <View key={item._id} style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.code}>{item.referralCode}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {backgroundColor: getStatusColor(item.status) + '20'},
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      {color: getStatusColor(item.status)},
                    ]}>
                    {getStatusLabel(item.status)}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <Ionicons name="home" size={16} color="#717171" />
                <Text style={styles.text}>
                  {item.listingId?.title || 'Annonce inconnue'}
                </Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="calendar" size={16} color="#717171" />
                <Text style={styles.text}>
                  {new Date(
                    item.bookingDates.checkIn,
                  ).toLocaleDateString()}{' '}
                  →{' '}
                  {new Date(
                    item.bookingDates.checkOut,
                  ).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="person" size={16} color="#717171" />
                <Text style={styles.text}>{item.guestEmail}</Text>
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
  filterBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 6,
    borderRadius: 16,
    backgroundColor: '#F7F7F7',
  },
  filterTabActive: {
    backgroundColor: '#FF5A5F',
  },
  filterText: {
    fontSize: 13,
    color: '#717171',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginTop: 16,
    marginBottom: 8,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  code: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  text: {
    fontSize: 14,
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
});

export default MyBookingsScreen;




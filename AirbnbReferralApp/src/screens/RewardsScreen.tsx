import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, ActivityIndicator} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {rewardApi, Reward, RewardMilestones} from '../services/rewardApi';

const RewardsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<Reward[]>([]);
  const [milestones, setMilestones] = useState<RewardMilestones | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load rewards and milestones separately to see which one fails
        let rewards: Reward[] = [];
        let ms: RewardMilestones | null = null;
        
        try {
          rewards = await rewardApi.getHistory();
          console.log('[Rewards] Loaded rewards:', rewards.length);
        } catch (error: any) {
          console.warn('[Rewards] Failed to load history:', error?.response?.data || error?.message);
          rewards = [];
        }
        
        try {
          ms = await rewardApi.getMilestones();
          console.log('[Rewards] Loaded milestones:', ms);
        } catch (error: any) {
          console.warn('[Rewards] Failed to load milestones:', error?.response?.data || error?.message);
          ms = null;
        }
        
        const totalPoints = rewards.reduce((sum, r) => sum + r.amount, 0);
        console.log('[Rewards] Total points calculated:', totalPoints);
        setPoints(totalPoints);
        setHistory(rewards);
        setMilestones(ms);
      } catch (error: any) {
        console.warn('[Rewards] Unexpected error:', error?.response?.data || error?.message);
        // Set defaults on error - don't crash
        setPoints(0);
        setHistory([]);
        setMilestones(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Solde points</Text>
        <Text style={styles.balance}>{points}</Text>
        <Text style={styles.description}>
          Vous gagnez 5 points pour chaque réservation confirmée par un hôte.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Prochaines étapes</Text>
        <View style={styles.milestone}>
          <Ionicons name="gift" size={40} color="#FF5A5F" />
          <View style={styles.milestoneContent}>
            <Text style={styles.milestoneTitle}>Nuit gratuite</Text>
            <Text style={styles.milestoneDesc}>
              Débloquez après 5 réservations validées
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progress,
                  {
                    width: `${
                      milestones
                        ? Math.min(
                            (milestones.completedBookings / milestones.nextMilestone) *
                              100,
                            100,
                          )
                        : 0
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {milestones ? milestones.completedBookings : 0} /{' '}
              {milestones ? milestones.nextMilestone : 5} réservations
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Historique</Text>
        {history.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyText}>Aucune transaction pour le moment</Text>
          </View>
        ) : (
          history.map(item => (
            <View key={item._id} style={styles.historyItem}>
              <View>
                <Text style={styles.historyTitle}>+{item.amount} points</Text>
                {item.notes && (
                  <Text style={styles.historyNote}>{item.notes}</Text>
                )}
              </View>
              <Text style={styles.historyDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 15,
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF5A5F',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#717171',
    lineHeight: 20,
  },
  milestone: {
    flexDirection: 'row',
    gap: 15,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 5,
  },
  milestoneDesc: {
    fontSize: 14,
    color: '#717171',
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F7F7F7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progress: {
    height: '100%',
    backgroundColor: '#FF5A5F',
  },
  progressText: {
    fontSize: 12,
    color: '#717171',
  },
  emptyHistory: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#717171',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
  },
  historyNote: {
    fontSize: 13,
    color: '#717171',
    marginTop: 2,
    maxWidth: 260,
  },
  historyDate: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 8,
  },
});

export default RewardsScreen;


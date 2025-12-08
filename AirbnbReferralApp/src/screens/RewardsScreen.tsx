import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

const RewardsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Solde actuel</Text>
        <Text style={styles.balance}>€0.00</Text>
        <Text style={styles.description}>
          Vos récompenses seront ajoutées ici une fois les réservations validées.
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
              <View style={[styles.progress, {width: '0%'}]} />
            </View>
            <Text style={styles.progressText}>0 / 5 réservations</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Historique</Text>
        <View style={styles.emptyHistory}>
          <Text style={styles.emptyText}>Aucune transaction pour le moment</Text>
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
});

export default RewardsScreen;


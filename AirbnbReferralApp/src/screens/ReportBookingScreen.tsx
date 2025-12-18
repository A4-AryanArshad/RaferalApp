import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useAuthState} from '../hooks/useAuthState';
import {useAuth} from '../contexts/AuthContext';
import api from '../services/api';
import {Ionicons} from '@expo/vector-icons';

const ReportBookingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {referralCode} = route.params as {referralCode?: string};
  const {user, isAuthenticated} = useAuthState();
  const {logout} = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    referralCode: referralCode || '',
    guestEmail: '',
    checkIn: '',
    checkOut: '',
    bookingConfirmation: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData({...formData, [field]: value});
  };

  const handleSubmit = async () => {
    if (
      !formData.referralCode ||
      !formData.guestEmail ||
      !formData.checkIn ||
      !formData.checkOut
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.guestEmail)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    // Validate dates
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
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
              // Logout will automatically show the Login screen
              await logout();
            },
          },
        ],
      );
      return;
    }

    setLoading(true);
    try {
      await api.post('/referrals/track-booking', {
        referralCode: formData.referralCode.trim().toUpperCase(),
        guestEmail: formData.guestEmail,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        bookingConfirmation: formData.bookingConfirmation || undefined,
        reportedBy: 'guest',
      });

      Alert.alert(
        'Succès',
        'Réservation signalée avec succès! Le propriétaire va confirmer votre réservation.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
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
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Signaler une réservation</Text>
          <Text style={styles.subtitle}>
            Aidez-nous à suivre votre réservation pour calculer vos récompenses
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Code de recommandation *</Text>
          <TextInput
            style={styles.input}
            placeholder="ABC12345"
            value={formData.referralCode}
            onChangeText={value => handleChange('referralCode', value.toUpperCase())}
            autoCapitalize="characters"
            editable={!loading}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Email du voyageur *</Text>
          <TextInput
            style={styles.input}
            placeholder="voyageur@example.com"
            value={formData.guestEmail}
            onChangeText={value => handleChange('guestEmail', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Date d'arrivée *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD (ex: 2024-06-15)"
            value={formData.checkIn}
            onChangeText={value => handleChange('checkIn', value)}
            editable={!loading}
            placeholderTextColor="#999"
          />
          <Text style={styles.hint}>Format: AAAA-MM-JJ</Text>

          <Text style={styles.label}>Date de départ *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD (ex: 2024-06-20)"
            value={formData.checkOut}
            onChangeText={value => handleChange('checkOut', value)}
            editable={!loading}
            placeholderTextColor="#999"
          />
          <Text style={styles.hint}>Format: AAAA-MM-JJ</Text>

          <Text style={styles.label}>Numéro de confirmation (optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Numéro de confirmation Airbnb"
            value={formData.bookingConfirmation}
            onChangeText={value => handleChange('bookingConfirmation', value)}
            editable={!loading}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Signaler la réservation</Text>
            )}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#FF5A5F" />
            <Text style={styles.infoText}>
              Après le signalement, le propriétaire confirmera votre réservation. Une fois
              confirmée, les récompenses seront attribuées.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#717171',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  hint: {
    fontSize: 12,
    color: '#717171',
    marginTop: 5,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#717171',
    lineHeight: 18,
  },
});

export default ReportBookingScreen;


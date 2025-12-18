import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../contexts/AuthContext';
import {authService} from '../../services/authService';
import {Ionicons} from '@expo/vector-icons';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'user' | 'host' | null>(null);
  const [loading, setLoading] = useState(false);
  const {login, logout} = useAuth();
  const navigation = useNavigation();

  const handleLogin = async (role: 'user' | 'host') => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!selectedRole) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type de connexion');
      return;
    }

    setLoading(true);
    try {
      // Login first
      await login(email, password);
      
      // Wait a moment for auth context to update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get user profile to verify role
      const userProfile = await authService.getProfile();
      
      // Login successful - navigation will be handled by auth context based on actual user role
      // The role selection button is just for UI, actual navigation is based on user.role from backend
      // No need to check role mismatch - let the app navigate to the correct screen based on actual role
    } catch (error: any) {
      let errorMessage = 'Échec de la connexion';
      
      // Handle network errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur http://localhost:3000';
      } else if (error.response?.data) {
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors
            .map((err: any) => err.msg || err.message || err)
            .join('\n');
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
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
        <View style={styles.content}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Bienvenue!</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
            editable={!loading}
          />

          {/* Login Type Selection */}
          <Text style={styles.roleLabel}>Je me connecte en tant que:</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                selectedRole === 'user' && styles.roleButtonActive,
              ]}
              onPress={() => setSelectedRole('user')}
              disabled={loading}>
              <Ionicons
                name="person-outline"
                size={24}
                color={selectedRole === 'user' ? '#FF5A5F' : '#717171'}
                style={styles.roleIcon}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  selectedRole === 'user' && styles.roleButtonTextActive,
                ]}>
                Voyageur
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                selectedRole === 'host' && styles.roleButtonActive,
              ]}
              onPress={() => setSelectedRole('host')}
              disabled={loading}>
              <Ionicons
                name="home-outline"
                size={24}
                color={selectedRole === 'host' ? '#FF5A5F' : '#717171'}
                style={styles.roleIcon}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  selectedRole === 'host' && styles.roleButtonTextActive,
                ]}>
                Hôte
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (loading || !selectedRole) && styles.buttonDisabled,
            ]}
            onPress={() => selectedRole && handleLogin(selectedRole)}
            disabled={loading || !selectedRole}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Signup' as never)}
            style={styles.linkButton}
            disabled={loading}>
            <Text style={styles.linkText}>
              Pas encore de compte? S'inscrire
            </Text>
          </TouchableOpacity>
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
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222222',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#717171',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  button: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#FF5A5F',
    fontSize: 14,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 10,
    marginTop: 5,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DDDDDD',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  roleButtonActive: {
    borderColor: '#FF5A5F',
    backgroundColor: '#FFF5F5',
  },
  roleIcon: {
    marginRight: 4,
  },
  roleButtonText: {
    fontSize: 16,
    color: '#717171',
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: '#FF5A5F',
    fontWeight: '600',
  },
});

export default LoginScreen;



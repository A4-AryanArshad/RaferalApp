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
import {Ionicons} from '@expo/vector-icons';

const SignupScreen = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'user' as 'user' | 'host',
  });
  const [loading, setLoading] = useState(false);
  const {register} = useAuth();
  const navigation = useNavigation();

  const handleSignup = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert(
        'Erreur',
        'Le mot de passe doit contenir au moins 8 caractères',
      );
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      // Registration successful - AuthContext will automatically update
      // and AppNavigator will switch to MainTabs (which includes Dashboard)
      // No need to manually navigate - the auth state change handles it
      Alert.alert('Succès', 'Inscription réussie!');
    } catch (error: any) {
      let errorMessage = "Échec de l'inscription";
      
      if (error.response?.data) {
        // Handle validation errors array
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
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>Créez votre compte</Text>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Prénom"
              value={formData.firstName}
              onChangeText={text =>
                setFormData({...formData, firstName: text})
              }
              placeholderTextColor="#999"
              editable={!loading}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Nom"
              value={formData.lastName}
              onChangeText={text => setFormData({...formData, lastName: text})}
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={text => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Téléphone (optionnel)"
            value={formData.phone}
            onChangeText={text => setFormData({...formData, phone: text})}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe (min. 8 caractères)"
            value={formData.password}
            onChangeText={text => setFormData({...formData, password: text})}
            secureTextEntry
            placeholderTextColor="#999"
            editable={!loading}
          />

          {/* Role Selection */}
          <Text style={styles.roleLabel}>Je suis:</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                formData.role === 'user' && styles.roleButtonActive,
              ]}
              onPress={() => setFormData({...formData, role: 'user'})}
              disabled={loading}>
              <Ionicons
                name="person-outline"
                size={24}
                color={formData.role === 'user' ? '#FF5A5F' : '#717171'}
                style={styles.roleIcon}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  formData.role === 'user' && styles.roleButtonTextActive,
                ]}>
                Voyageur
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                formData.role === 'host' && styles.roleButtonActive,
              ]}
              onPress={() => setFormData({...formData, role: 'host'})}
              disabled={loading}>
              <Ionicons
                name="home-outline"
                size={24}
                color={formData.role === 'host' ? '#FF5A5F' : '#717171'}
                style={styles.roleIcon}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  formData.role === 'host' && styles.roleButtonTextActive,
                ]}>
                Hôte
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login' as never)}
            style={styles.linkButton}
            disabled={loading}>
            <Text style={styles.linkText}>
              Déjà un compte? Se connecter
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
    paddingVertical: 40,
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
    marginBottom: 30,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
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
  halfInput: {
    flex: 1,
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

export default SignupScreen;



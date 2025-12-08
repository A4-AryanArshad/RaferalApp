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
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import {listingService} from '../services/listingService';
import {Ionicons} from '@expo/vector-icons';
import {Linking} from 'react-native';

const CreateListingScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    country: '',
    address: '',
    pricePerNight: '',
    currency: 'EUR',
    amenities: '',
    airbnbListingUrl: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData({...formData, [field]: value});
  };

  const requestImagePermission = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin de la permission pour accéder à vos photos.',
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestImagePermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages([...images, ...newImages]);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner les images');
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.city ||
      !formData.country ||
      !formData.address ||
      !formData.pricePerNight
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const listing = await listingService.createListing({
        title: formData.title,
        description: formData.description,
        location: {
          city: formData.city,
          country: formData.country,
          address: formData.address,
        },
        pricePerNight: parseFloat(formData.pricePerNight),
        currency: formData.currency,
        amenities: formData.amenities
          ? formData.amenities.split(',').map(a => a.trim())
          : [],
        images: images, // Send image URIs (in production, upload to cloud storage first)
        airbnbListingUrl: formData.airbnbListingUrl || undefined,
      });

      Alert.alert('Succès', 'Annonce créée avec succès!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      let errorMessage = 'Échec de la création';
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
          <Text style={styles.title}>Créer une annonce</Text>
          <Text style={styles.subtitle}>Ajoutez votre location</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Appartement moderne à Paris"
            value={formData.title}
            onChangeText={value => handleChange('title', value)}
            editable={!loading}
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Décrivez votre location..."
            value={formData.description}
            onChangeText={value => handleChange('description', value)}
            multiline
            numberOfLines={4}
            editable={!loading}
          />

          <Text style={styles.label}>Ville *</Text>
          <TextInput
            style={styles.input}
            placeholder="Paris"
            value={formData.city}
            onChangeText={value => handleChange('city', value)}
            editable={!loading}
          />

          <Text style={styles.label}>Pays *</Text>
          <TextInput
            style={styles.input}
            placeholder="France"
            value={formData.country}
            onChangeText={value => handleChange('country', value)}
            editable={!loading}
          />

          <Text style={styles.label}>Adresse *</Text>
          <TextInput
            style={styles.input}
            placeholder="123 Rue Example"
            value={formData.address}
            onChangeText={value => handleChange('address', value)}
            editable={!loading}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Prix par nuit *</Text>
              <TextInput
                style={styles.input}
                placeholder="120"
                value={formData.pricePerNight}
                onChangeText={value => handleChange('pricePerNight', value)}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Devise</Text>
              <TextInput
                style={styles.input}
                placeholder="EUR"
                value={formData.currency}
                onChangeText={value => handleChange('currency', value)}
                editable={!loading}
              />
            </View>
          </View>

          <Text style={styles.label}>Lien Airbnb (optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://www.airbnb.com/rooms/..."
            value={formData.airbnbListingUrl}
            onChangeText={value => handleChange('airbnbListingUrl', value)}
            keyboardType="url"
            autoCapitalize="none"
            editable={!loading}
          />
          <Text style={styles.hint}>
            Les utilisateurs pourront cliquer sur ce lien pour voir votre annonce sur Airbnb
          </Text>

          <Text style={styles.label}>Images</Text>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={pickImage}
            disabled={loading}>
            <Ionicons name="image-outline" size={20} color="#FF5A5F" />
            <Text style={styles.imagePickerText}>
              {images.length > 0
                ? `Ajouter plus d'images (${images.length} sélectionnées)`
                : 'Ajouter des images'}
            </Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <View style={styles.imageGrid}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{uri}} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}>
                    <Ionicons name="close-circle" size={24} color="#FF5A5F" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.label}>Équipements (séparés par des virgules)</Text>
          <TextInput
            style={styles.input}
            placeholder="WiFi, Cuisine, Lave-linge"
            value={formData.amenities}
            onChangeText={value => handleChange('amenities', value)}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Créer l'annonce</Text>
            )}
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  hint: {
    fontSize: 12,
    color: '#717171',
    marginTop: 5,
    fontStyle: 'italic',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    padding: 15,
    borderWidth: 2,
    borderColor: '#FF5A5F',
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 10,
  },
  imagePickerText: {
    color: '#FF5A5F',
    fontSize: 16,
    fontWeight: '600',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
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
});

export default CreateListingScreen;

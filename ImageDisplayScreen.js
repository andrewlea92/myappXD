import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { generateAiProcessedImage, simulateApiUploadAndProcess } from './AiApiHandler';

export default function ImageDisplayScreen({ route, navigation }) {
  const { imageUrls } = route.params;
  const [processedUrls, setProcessedUrls] = useState([]);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // Add state for alert

  const handleAiEdit = async () => {
    // Simulate uploading images to an external API and receiving processed images
    const processed = await generateAiProcessedImage(imageUrls);
    setProcessedUrls(processed);
    setShowNextButton(true);
    setShowAlert(true); // Show alert

    // Hide alert after 3 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 1500);

    console.log('AI 修圖 button pressed');
  };

  const handleNextStep = () => {
    // Navigate to the ProcessedImagesScreen
    navigation.navigate('ProcessedImages', { processedUrls });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {(processedUrls.length > 0 ? processedUrls : imageUrls).map((url, index) => (
        <View key={index} style={styles.imageContainer}>
          <Image
            key={index}
            source={{ uri: url }}
            style={styles.image}
          />
        </View>
      ))}
      {showAlert && (
        <View style={styles.alertContainer}>
          <Text style={styles.alertText}>AI 修圖完畢!</Text>
        </View>
      )}
      {showNextButton && (
        <TouchableOpacity style={styles.button} onPress={handleNextStep}>
          <Text style={styles.buttonText}>下一步</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.button} onPress={handleAiEdit}>
        <Text style={styles.buttonText}>AI 修圖</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 250,
    height: 250,
  },
  urlText: {
    marginTop: 5,
    fontSize: 12,
    color: 'gray',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  alertContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFD700',
    borderRadius: 5,
  },
  alertText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
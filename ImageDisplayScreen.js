import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';

export default function ImageDisplayScreen({ route, navigation }) {
  const { imageUrls } = route.params;
  const [processedUrls, setProcessedUrls] = useState([]);
  const [showNextButton, setShowNextButton] = useState(false);

  const handleAiEdit = async () => {
    // Simulate uploading images to an external API and receiving processed images
    const processed = await simulateApiUploadAndProcess(imageUrls);
    setProcessedUrls(processed);
    setShowNextButton(true);
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
          <Text style={styles.urlText}>{url.slice(-15)}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.button} onPress={handleAiEdit}>
        <Text style={styles.buttonText}>AI 修圖</Text>
      </TouchableOpacity>
      {showNextButton && (
        <TouchableOpacity style={styles.button} onPress={handleNextStep}>
          <Text style={styles.buttonText}>下一步</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const simulateApiUploadAndProcess = async (imageUrls) => {
  // Simulate a delay for the API call
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate processed image URLs (in a real scenario, these would be returned by the API)
  return imageUrls.map(url => `${url}?processed=true`);
};


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
});
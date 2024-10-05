import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';

export default function ImageDisplayScreen({ route }) {
  const { imageUrls } = route.params;
  const [processedUrls, setProcessedUrls] = useState([]);

  const handleAiEdit = () => {
    // Simulate image processing by adding a border to the images
    setProcessedUrls(imageUrls);
    console.log('AI 修圖 button pressed');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {(processedUrls.length > 0 ? processedUrls : imageUrls).map((url, index) => (
        <Image
          key={index}
          source={{ uri: url }}
          style={[styles.image, processedUrls.length > 0 && styles.processedImage]}
        />
      ))}
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
  image: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  processedImage: {
    borderWidth: 5,
    borderColor: 'red',
    opacity: 0.8,
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
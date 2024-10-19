import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView, Dimensions } from 'react-native';
import { generateAiProcessedImage } from './AiApiHandler';
import { debugProcessedImage, debugMode } from './DebugApiHandler';

const { width, height } = Dimensions.get('window');

export default function ImageDisplayScreen({ route, navigation }) {
  const { imageUrls } = route.params;
  const [processedUrls, setProcessedUrls] = useState([]);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // Add state for alert

  const handleAiEdit = async () => {
    console.log("imageUrls", imageUrls);
    let processed = [];
    // Simulate uploading images to an external API and receiving processed images
    if (debugMode) {
      processed = await debugProcessedImage(imageUrls);
      console.log('Processed URLs:', processed);
    }
    else {
      processed = await generateAiProcessedImage(imageUrls);
    }
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
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}>
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
      </ScrollView>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.button} onPress={handleAiEdit}>
          <Text style={styles.buttonText}>AI 修圖</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    width: width * 3,
  },
  imageContainer: {
    alignItems: 'center',
    width: width,
    height: '100%',
    paddingLeft: 10,
    paddingRight: 10,
  },
  image: {
    width: '100%',
    height: '75%',
  },
  urlText: {
    marginTop: 5,
    fontSize: 12,
    color: 'gray',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alighItems: 'center',
    backgroundColor: '#FFF',
    height: '15%',
    marginBottom: '10%',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '3%',
    width: '30%',
    height: '75%'
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
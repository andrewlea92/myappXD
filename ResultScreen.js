import React from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, Clipboard, Alert, ScrollView } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
// import Clipboard from '@react-native-clipboard/clipboard';
import { LogBox } from 'react-native';
import { debugMode } from './DebugApiHandler';
import Icon from 'react-native-vector-icons/FontAwesome';
LogBox.ignoreAllLogs(); // for suppressing clipboard warning

// Function to save Base64 image to Media Library
const saveImageToMediaLibrary = async (base64DataUrl) => {
  let fileUri;
  if (debugMode) {
    console.log(base64DataUrl);
    fileUri = base64DataUrl;
  } else {
    fileUri = `${FileSystem.documentDirectory}photo_${Date.now()}.jpg`;

    // Extract the Base64 string from the data URL
    const base64Image = base64DataUrl.split(',')[1];

    // Write the Base64 image to a file
    await FileSystem.writeAsStringAsync(fileUri, base64Image, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  // Save the file to the media library
  const asset = await MediaLibrary.createAssetAsync(fileUri);
  // await MediaLibrary.createAlbumAsync('FoodgramAI', asset, false);
  console.log('Saved to:', fileUri);

  return fileUri;
};

export default function ResultScreen({ route }) {
  const { processedUrls, aiText } = route.params;

  const saveToAlbum = async () => {
    try {
      for (const base64DataUrl of processedUrls) {
        await saveImageToMediaLibrary(base64DataUrl);
      }
      Alert.alert('已成功儲存至手機');
    } catch (error) {
      Alert.alert('儲存至手機失敗');
      console.error(error);
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(aiText);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {processedUrls.map((url, index) => (
        <Image key={index} source={{ uri: url }} style={styles.image} />
      ))}
      {/* <TouchableOpacity style={styles.button} onPress={saveToAlbum}>
        <Text style={styles.buttonText}>儲存至手機</Text>
      </TouchableOpacity> */}
      <TouchableOpacity style={styles.circleButton} onPress={saveToAlbum}>
        <Icon name="download" size={30} color="white" />
      </TouchableOpacity>
      <Text style={styles.aiText}>{aiText}</Text>
      {/* <TouchableOpacity style={styles.button} onPress={copyToClipboard}>
        <Text style={styles.buttonText}>複製文案</Text>
      </TouchableOpacity> */}
      <TouchableOpacity style={styles.circleButton} onPress={copyToClipboard}>
        <Icon name="copy" size={30} color="white" />
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
  button: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  aiText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  circleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
});
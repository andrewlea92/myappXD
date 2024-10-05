import React from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, Clipboard, Alert, ScrollView } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
// import Clipboard from '@react-native-clipboard/clipboard';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(); // for suppressing clipboard warning

export default function ResultScreen({ route }) {
  const { processedUrls, aiText } = route.params;

  const saveToAlbum = async () => {
    try {
      for (const url of processedUrls) {
        await MediaLibrary.createAssetAsync(url);
      }
      Alert.alert('Success', 'Images saved to album');
    } catch (error) {
      Alert.alert('Error', 'Failed to save images');
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(aiText);
    Alert.alert('Copied', 'Text copied to clipboard');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {processedUrls.map((url, index) => (
        <Image key={index} source={{ uri: url }} style={styles.image} />
      ))}
      <TouchableOpacity style={styles.button} onPress={saveToAlbum}>
        <Text style={styles.buttonText}>儲存至手機</Text>
      </TouchableOpacity>
      <Text style={styles.aiText}>{aiText}</Text>
      <TouchableOpacity style={styles.button} onPress={copyToClipboard}>
        <Text style={styles.buttonText}>複製文案</Text>
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
});
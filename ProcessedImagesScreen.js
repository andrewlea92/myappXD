import React, { useState } from 'react';
import { View, Image, StyleSheet, TextInput, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function ProcessedImagesScreen({ route }) {
  const { processedUrls } = route.params;
  const [aiText, setAiText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAiText = async () => {
    setLoading(true);
    // Simulate generating AI text using OpenAI API
    const generatedText = await simulateOpenAiApiCall();
    setAiText(generatedText);
    setLoading(false);
    console.log('AI 文案 button pressed');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {processedUrls.map((url, index) => (
        <View key={index} style={styles.imageContainer}>
          <Image source={{ uri: url }} style={styles.image} />
          <Text style={styles.urlText}>{url.slice(-15)}</Text>
        </View>
      ))}
      <TextInput
        style={styles.input}
        placeholder="Enter text here"
        value={aiText}
        onChangeText={setAiText} // Update state on text change
      />
      <View style={styles.buttonContainer}>
        {loading && <ActivityIndicator size="small" color="#007AFF" style={styles.loadingIndicator} />}
        <TouchableOpacity style={styles.button} onPress={handleAiText} disabled={loading}>
          <Text style={styles.buttonText}>AI 文案</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const simulateOpenAiApiCall = async () => {
  // Simulate a delay for the API call
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulate the response from OpenAI API
  return '這是 AI 生成的文案';
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
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginRight: 10,
  },
});
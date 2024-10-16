import React, { useState } from 'react';
import { View, Image, StyleSheet, TextInput, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { generateAiCaption, generateAiCaptionWithAudio } from './AiApiHandler';
import { Audio } from 'expo-av';

export default function ProcessedImagesScreen({ route, navigation }) {
  const { processedUrls } = route.params;
  const [storeName, setStoreName] = useState('');
  const [items, setItems] = useState('');
  const [review, setReview] = useState('');
  const [aiText, setAiText] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState();
  const [recordedUrl, setRecordedUrl] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  const handleAiText = async () => {
    setLoading(true);
    // Simulate generating AI text using OpenAI API
    const generatedText = await generateAiCaption(storeName, items, review);
    setAiText(generatedText);
    setLoading(false);
    console.log('AI 文案 button pressed');
  };

  const handleNextStep = () => {
    // Navigate to the Result screen
    navigation.navigate('Result', { processedUrls, aiText });
    console.log('下一步 button pressed');
  };

  async function startRecording() {
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    setRecordedUrl(uri);
    // Play the recorded audio
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  }

  async function replayRecording() {
    if (recordedUrl) {
      const uri = recordedUrl;
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } else {
      console.log('No recording available to replay');
    }
  }

  const handleAiText2 = async () => {
    setLoading(true);
    // Simulate generating AI text using OpenAI API
    const generatedText = await generateAiCaptionWithAudio(recordedUrl);
    setAiText(generatedText);
    setLoading(false);
    console.log('AI 文案2 button pressed');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {processedUrls.map((url, index) => (
        <View key={index} style={styles.imageContainer}>
          <Image source={{ uri: url }} style={styles.image} />
        </View>
      ))}
      <TouchableOpacity style={styles.button} onPress={recording ? stopRecording : startRecording}>
        <Text style={styles.buttonText}>{recording ? 'Stop Recording' : 'Start Recording'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={replayRecording}>
        <Text style={styles.buttonText}>重新聽錄音</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleAiText2}>
        <Text style={styles.buttonText}>AI 文案with錄音</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="輸入店名"
        value={storeName}
        onChangeText={setStoreName} // Update state on text change
      />
      <TextInput
        style={styles.input}
        placeholder="輸入商品"
        value={items}
        onChangeText={setItems} // Update state on text change
      />
      <TextInput
        style={styles.input}
        placeholder="輸入評論"
        value={review}
        onChangeText={setReview} // Update state on text change
      />
      <View style={styles.buttonContainer}>
        {loading && <ActivityIndicator size="small" color="#007AFF" style={styles.loadingIndicator} />}
        <TouchableOpacity style={styles.button} onPress={handleAiText} disabled={loading}>
          <Text style={styles.buttonText}>AI 文案</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.aiTextBox}>
        <Text style={styles.aiText}>{aiText || 'AI 文案將顯示在這裡'}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleNextStep}>
        <Text style={styles.buttonText}>下一步</Text>
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
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginRight: 10,
  },
  aiTextBox: {
    width: '80%',
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 20,
    backgroundColor: '#f0f0f0',
  },
  aiText: {
    fontSize: 16,
    color: 'black',
  },
});
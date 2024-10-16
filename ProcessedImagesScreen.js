import React, { useState } from 'react';
import { View, Image, StyleSheet, TextInput, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { generateAiCaption, generateAiCaptionWithAudio } from './AiApiHandler';
import { debugCaption, debugCaptionWithAudio, debugMode } from './DebugApiHandler';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/FontAwesome';

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
  const [isRecordingMode, setIsRecordingMode] = useState(false); // 新增狀態來控制錄音或手動輸入

  const handleAiTextWithHint = async () => {
    setLoading(true);

    let generatedText;
    if (debugMode) {
      generatedText = await debugCaption(storeName, items, review);
    } else {
      generatedText = await generateAiCaption(storeName, items, review);
    }

    setAiText(generatedText);
    setLoading(false);
    console.log('AI 文案 button pressed');
  };

  const handleNextStep = () => {
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

  const handleAiTextWithAudio = async () => {
    setLoading(true);
    let generatedText;
    if (debugMode) {
      generatedText = await debugCaptionWithAudio(recordedUrl);
    } else {
      generatedText = await generateAiCaptionWithAudio(recordedUrl);
    }

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
      
      {/* 新增選擇模式的按鈕 */}
      <View style={styles.buttonContainer}>
      <TouchableOpacity style={[styles.button, styles.buttonMargin]} onPress={() => setIsRecordingMode(true)}>
        <Text style={styles.buttonText}>錄音</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.buttonMargin]} onPress={() => setIsRecordingMode(false)}>
        <Text style={styles.buttonText}>手動輸入</Text>
      </TouchableOpacity>
      </View>

      {isRecordingMode ? (
        // 錄音模式的按鈕
        <>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.circleButton} onPress={recording ? stopRecording : startRecording}>
              <Icon name={recording ? 'stop' : 'microphone'} size={30} color={recording ? 'red' : 'green'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleButton} onPress={replayRecording}>
              <Icon name="repeat" size={30} color="white"/>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleAiTextWithAudio}>
            <Text style={styles.buttonText}>錄音檔生成 AI 文案</Text>
          </TouchableOpacity>
        </>
      ) : (
        // 手動輸入模式的輸入框
        <>
          <TextInput
            style={styles.input}
            placeholder="輸入店名"
            value={storeName}
            onChangeText={setStoreName}
          />
          <TextInput
            style={styles.input}
            placeholder="輸入商品"
            value={items}
            onChangeText={setItems}
          />
          <TextInput
            style={styles.input}
            placeholder="輸入評論"
            value={review}
            onChangeText={setReview}
          />
          <View style={styles.buttonContainer}>
            {loading && <ActivityIndicator size="small" color="#007AFF" style={styles.loadingIndicator} />}
            <TouchableOpacity style={styles.button} onPress={handleAiTextWithHint} disabled={loading}>
              <Text style={styles.buttonText}>生成 AI 文案</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

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
    justifyContent: 'space-between', // 可選：讓按鈕平均分佈
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
  buttonMargin: {
    marginHorizontal: 10, // 調整此值以增加按鈕之間的水平間距
  },
  circleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 10,
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

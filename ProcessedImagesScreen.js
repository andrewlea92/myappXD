import React, { useState } from 'react';
import { View, Image, StyleSheet, TextInput, ScrollView, Text, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Rating, AirbnbRating } from 'react-native-ratings';
import { generateAiCaption, generateAiCaptionWithAudio } from './AiApiHandler';
import { debugCaption, debugCaptionWithAudio, debugMode } from './DebugApiHandler';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomRating from './components/rating'

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
  const [isRecordingComplete, setIsRecordingComplete] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackObject, setPlaybackObject] = useState(null);

  /* -------------------------------------------------------------------------- */
  /*                               Rating Related                               */
  /* -------------------------------------------------------------------------- */

  const [tasteRating, setTasteRating] = useState(0)
  const [envRating, setEnvRating] = useState(0)
  const [moneyRating, setMoneyRating] = useState(0)

  const handleTasteRating = (rating) => {
    setTasteRating(rating)
  }

  const handleEnvRating = (rating) => {
    setEnvRating(rating)
  }

  const handleMoneyRating = (rating) => {
    setMoneyRating(rating)
  }

  /* -------------------------------------------------------------------------- */
  /*                                                                            */
  /* -------------------------------------------------------------------------- */

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

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
    setIsModalVisible(false); // Close the modal after generating AI text
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
    setIsRecordingComplete(true); // Set recording complete to true
  }

  const resetRecording = () => {
    setRecording(undefined);
    setRecordedUrl(undefined);
    setIsRecordingComplete(false); // Reset recording complete to false
  };

  const replayRecording = async () => {
    try {
      if (isPlaying) {
        console.log('Stopping playback..');
        // Stop playback if already playing
        if (playbackObject) {
          await playbackObject.stopAsync();
          await playbackObject.unloadAsync();
          setPlaybackObject(null);
        }
        setIsPlaying(false);
      } else {
        // Start playback
        console.log('Starting playback..');
        const { sound } = await Audio.Sound.createAsync(
          { uri: recordedUrl },
          { shouldPlay: true }
        );
        setPlaybackObject(sound);
        setIsPlaying(true);
  
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            console.log('Stopping playback..');
            setIsPlaying(false);
            setPlaybackObject(null);
          }
        });
      }
    } catch (error) {
      console.error('Error during playback:', error);
    }
  };

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

    <View style={styles.buttonContainer}>
      {!isRecordingComplete ? (
        <TouchableOpacity style={styles.circleButton} onPress={recording ? stopRecording : startRecording}>
          <Icon name={recording ? 'stop' : 'microphone'} size={30} color={recording ? 'red' : 'green'} />
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity style={styles.circleButton} onPress={replayRecording}>
            <Icon name={isPlaying ? 'pause' : 'play'} size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleButton} onPress={resetRecording}>
            <Icon name="trash-o" size={30} color="white"/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleButton} onPress={handleAiTextWithAudio}>
            <Image
              source={require('./assets/Gemini_icon.png')} // Update the path to your custom icon file
              style={styles.customIcon}
            />
          </TouchableOpacity>
        </>
      )}
    </View>

    {/* 評分系統 */}
    <View style={styles.rateContainer}>
      <CustomRating title={'口味'} setRating={handleTasteRating}/>
      <CustomRating title={'價格'} setRating={handleMoneyRating}/>
      <CustomRating title={'環境'} setRating={handleEnvRating}/>
      {/* <Text style={styles.buttonText}>{tasteRating}</Text>
      <Text style={styles.buttonText}>{moneyRating}</Text>
      <Text style={styles.buttonText}>{envRating}</Text> */}
    </View>


    <View style={styles.aiTextBox}>
      <Text style={styles.aiText}>{aiText || 'AI 文案將顯示在這裡'}</Text>
    </View>
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.circleButton} onPress={toggleModal}>
        <Icon name="comment-o" size={30} color="white"/>
      </TouchableOpacity>
    </View>
    <TouchableOpacity style={styles.button} onPress={handleNextStep}>
      <Text style={styles.buttonText}>下一步</Text>
    </TouchableOpacity>

    {/* Modal for manual input */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={toggleModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <TextInput
            style={styles.input}
            placeholder="輸入店名"
            placeholderTextColor="#999" // Ensure placeholder text color is set
            value={storeName}
            onChangeText={setStoreName}
          />
          <TextInput
            style={styles.input}
            placeholder="輸入商品"
            placeholderTextColor="#999" // Ensure placeholder text color is set
            value={items}
            onChangeText={setItems}
          />
          <TextInput
            style={styles.input}
            placeholder="輸入評論"
            placeholderTextColor="#999" // Ensure placeholder text color is set
            value={review}
            onChangeText={setReview}
          />
          <View style={styles.buttonContainer}>
            {loading && <ActivityIndicator size="small" color="#007AFF" style={styles.loadingIndicator} />}
            <TouchableOpacity style={styles.button} onPress={handleAiTextWithHint} disabled={loading}>
              <Text style={styles.buttonText}>生成 AI 文案</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button} onPress={toggleModal}>
            <Text style={styles.buttonText}>關閉</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  rateContainer: {
    // flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // 可選：讓按鈕平均分佈
    width: '80%',
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
    backgroundColor: 'black',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: '#000', // Ensure text color is set
  },
  customIcon: {
    width: 30,
    height: 30,
  },
});

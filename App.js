import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, Clipboard, TextInput, Modal , ScrollView} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as React from "react";
import ImageDisplayScreen from './ImageDisplayScreen'; // Import the new screen
import ProcessedImagesScreen from './ProcessedImagesScreen';
import ResultScreen from './ResultScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { generateAiOverlay } from './AiApiHandler';
import { debugOverlay , debugMode } from './DebugApiHandler';
import Slider from '@react-native-community/slider';
import { PanGestureHandler } from 'react-native-gesture-handler';


const Stack = createStackNavigator();

function CameraScreen({ navigation }) {
  const [facing, setFacing] = React.useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = React.useState(null);
  const [imageUrls, setImageUrls] = React.useState([]);
  const [imageCount, setImageCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [overlayImages, setOverlayImages] = React.useState([]);
  const [shownOverlayImageIdx, setShownOverlayImageIdx] = React.useState(0); // State to manage the shown overlay image index
  const [overlayOpacity, setOverlayOpacity] = React.useState(1); // State to control overlay opacity
  const [foodInput, setFoodInput] = React.useState(''); // State to manage food input
  const [isModalVisible, setIsModalVisible] = React.useState(false); // 管理彈窗狀態
  const [swipeStartX, setSwipeStartX] = React.useState(null);

  const handleGesture = (event) => {
    const { translationX } = event.nativeEvent;
    if (swipeStartX === null) {
      setSwipeStartX(translationX);
    } else {
      const deltaX = translationX - swipeStartX;
      // 右滑動觸發切換下一張圖片
      if (deltaX > 10) {
        cycleOverlayImage();
        setSwipeStartX(null); // 重置起始點
      } 
      // 左滑動可加入其他功能，例如回到前一張圖片
      else if (deltaX < -10) {
        // 左滑可以加入其它功能，比如回到前一张图片
        setSwipeStartX(null); // 重置起始點
      }
    }
  };

  React.useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      if (mediaLibraryStatus.status !== 'granted') {
        alert('Sorry, we need media library permissions to make this work!');
      }
    })();
  }, []);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setImageCount(0);
      setImageUrls([]);
    });

    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    if (imageCount === 3) {
      navigation.navigate('ImageDisplay', { imageUrls });
    }
  }, [imageCount, imageUrls, navigation]);

  if (hasCameraPermission === false) {
    return <View />;
  }

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const openModal = () => {
    setIsModalVisible(true);
  };
  
  const closeModal = () => {
    setIsModalVisible(false);
  };

  const cycleOverlayImage = () => {
    if (overlayImages.length > 0) {
      setShownOverlayImageIdx((prevIdx) => (prevIdx + 1) % overlayImages.length);
    }
  }

  const renderOverlayImages = () => {
    if (overlayImages.length > 0 && shownOverlayImageIdx < overlayImages.length) {
      return (
          <Image
            source={overlayImages[shownOverlayImageIdx]}
            style={[styles.overlayImage, { opacity: overlayOpacity }]}
            resizeMode="contain"
            pointerEvents="none" // This ensures that the image doesn't block interactions
          />
      );
    }
    return <Image style={styles.emptyOverlayImage} />;
  };
  

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      setTimeout(() => setLoading(true), 250); // Show after blinking effect with delay
      const photo = await cameraRef.current.takePictureAsync();
      setImageCount(imageCount + 1);
      const asset = photo;
      setImageUrls([...imageUrls, asset.uri]);
      setLoading(false);
    }
  };

  const handleAiOverlay = async () => {
    if (cameraRef.current) {
      setTimeout(() => setLoading(true), 250); // Show after blinking effect with delay
      const photo = await cameraRef.current.takePictureAsync();
      
      let overlayImages;
      if (debugMode) {
        console.log('Debug mode enabled');
        overlayImages = await debugOverlay(photo.uri, foodInput);
        
      } else {
        // Call generateAiOverlay with the photo URI
        overlayImages = await generateAiOverlay(photo.uri, foodInput);
      }
  
      setOverlayImages(overlayImages); // Set the overlay image to the first image in the array
  
      setLoading(false);
      console.log('AI 覆蓋 button pressed');
    }
  };


  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={handleGesture}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.circleButton} onPress={toggleCameraFacing}>
              <Icon name="refresh" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleButton} onPress={takePicture} disabled={loading}>
              <Icon name="camera" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleButton} onPress={handleAiOverlay} disabled={loading}>
              <Icon name="magic" size={30} color="white" />
            </TouchableOpacity>
          </View>
          {renderOverlayImages()}
        </CameraView>
      </PanGestureHandler>
      {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator}/>}
      <Text style={styles.imageCountText}>{imageCount} / 3</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Overlay Opacity</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={overlayOpacity}
          onValueChange={setOverlayOpacity}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#ccc" 
          thumbTintColor="#fff" 
        />
      </View>
      {/* 新增按鈕來打開彈窗 */}
      <TouchableOpacity style={styles.openModalButton} onPress={openModal}>
        <Icon name="lightbulb-o" size={30} color="white"/>
      </TouchableOpacity>

      {/* 彈出式視窗 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>請輸入你吃的食物</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="你吃的是..."
              value={foodInput}
              onChangeText={setFoodInput}
            />
            <TouchableOpacity style={styles.closeModalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>確認</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Camera">
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="ImageDisplay" component={ImageDisplayScreen} />
        <Stack.Screen name="ProcessedImages" component={ProcessedImagesScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  overlayImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  emptyOverlayImage: {
    width: 0,
    height: 0,
    opacity: 0,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
    justifyContent: 'space-between', // Distribute buttons evenly
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  circleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  imageCountText: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  sliderContainer: {
    position: 'absolute',
    top: '50%',
    right: 50, // 將 right 屬性調整為 10，向左移動
    transform: [{ rotate: '-90deg' }, { translateY: -150 }],
    width: 300,
    height: 100,
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
  },
  sliderLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  foodInput: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  nextOverlayButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  openModalButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',    
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
  },
  modalInput: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  closeModalButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
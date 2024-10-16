import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, Clipboard, TextInput } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as React from "react";
import ImageDisplayScreen from './ImageDisplayScreen'; // Import the new screen
import ProcessedImagesScreen from './ProcessedImagesScreen';
import ResultScreen from './ResultScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { generateAiOverlay } from './AiApiHandler';
import Slider from '@react-native-community/slider';

const Stack = createStackNavigator();

function CameraScreen({ navigation }) {
  const [facing, setFacing] = React.useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const cameraRef = React.useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = React.useState(null);
  const [imageUrls, setImageUrls] = React.useState([]);
  const [imageCount, setImageCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [overlayImages, setOverlayImages] = React.useState([]);
  const [shownOverlayImageIdx, setShownOverlayImageIdx] = React.useState(0); // State to manage the shown overlay image index
  const [overlayOpacity, setOverlayOpacity] = React.useState(1); // State to control overlay opacity
  const [foodInput, setFoodInput] = React.useState(''); // State to manage food input

  React.useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
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
            resizeMode="contain" // Ensure the image scales proportionally
          />
      );
    }
    return <Image style={styles.emptyOverlayImage} />; // Return an empty Image component if no overlay image is available
  
    if (overlayImage) {
      return <Image
        source={overlayImage} 
        style={[styles.overlayImage, { opacity: overlayOpacity }]}  
        resizeMode="contain" // 使用 contain 確保圖片按原始比例縮放
      />;
    }
    return <Image style={styles.emptyOverlayImage} />; // 返回一个空的 Image 组件;
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
      
      // Call generateAiOverlay with the photo URI
      const overlayImages = await generateAiOverlay(photo.uri, foodInput);

      setOverlayImages(overlayImages); // Set the overlay image to the first image in the array
  
      setLoading(false);
      console.log('AI 覆蓋 button pressed');
    }
  };
  

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>翻轉鏡頭</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleButton} onPress={takePicture} disabled={loading}>
            <Icon name="camera" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleAiOverlay} disabled={loading}>
            <Text style={styles.text}>AI 框線提示</Text>
          </TouchableOpacity>
        </View>
        {renderOverlayImages()}
      </CameraView>
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
          maximumTrackTintColor="#000000"
        />
      </View>
      <TextInput
        style={styles.foodInput}
        placeholder="你吃的是..."
        value={foodInput}
        onChangeText={setFoodInput}
      />
      <TouchableOpacity style={styles.nextOverlayButton} onPress={cycleOverlayImage}>
        <Text style={styles.text}>Next Overlay Image</Text>
      </TouchableOpacity>
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
    // top: '25%',
    // left: '25%',
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
    right: 20,
    transform: [{ rotate: '-90deg' }, { translateY: -150 }], // Rotate and position the slider
    width: 300, // Adjust the width to fit the screen
    height: 40,
    justifyContent: 'center',
  },
  sliderLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    // transform: [{ rotate: '90deg' }], // Rotate the label back to normal
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
});
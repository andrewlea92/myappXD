import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as React from "react";
import ImageDisplayScreen from './ImageDisplayScreen'; // Import the new screen
import ProcessedImagesScreen from './ProcessedImagesScreen';
import ResultScreen from './ResultScreen';

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
  const [overlayImage, setOverlayImage] = React.useState(null);

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

  const renderOverlayImage = () => {
    if (overlayImage) {
      return <Image source={overlayImage} style={styles.overlayImage} />;
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
    setLoading(true);
    // Simulate generating AI overlay image
    const overlayImage = await simulateAiOverlay();
    setOverlayImage(overlayImage);
    setLoading(false);
    console.log('AI 覆蓋 button pressed');
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>翻轉鏡頭</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>拍照</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleAiOverlay} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={styles.text}>AI 框線提示</Text>
            )}
          </TouchableOpacity>
        </View>
        {renderOverlayImage()}
      </CameraView>
      {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator}/>}
      <Text style={styles.imageCountText}>{imageCount} / 3</Text>
    </View>
  );
}

const simulateAiOverlay = async () => {
  // Simulate a delay for the AI overlay generation
  await new Promise(resolve => setTimeout(resolve, 1000));

  const images = [
    require('./assets/pose/1.png'),
    require('./assets/pose/2.png'),
    require('./assets/pose/3.png'),
  ];
  const randomImage = images[Math.floor(Math.random() * images.length)];

  // Simulate the AI overlay image (in a real scenario, this would be returned by the API)
  return randomImage;
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
    top: '-25%',
    left: '-25%',
    width: '150%',
    height: '150%',
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
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  imageCountText: {
    position: 'absolute',
    top: 10,
    right: 10,
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
});
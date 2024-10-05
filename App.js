import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as React from "react";
import ImageDisplayScreen from './ImageDisplayScreen'; // Import the new screen
import ProcessedImagesScreen from './ProcessedImagesScreen';

const Stack = createStackNavigator();

function CameraScreen({ navigation }) {
  const [facing, setFacing] = React.useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const cameraRef = React.useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = React.useState(null);
  const [imageUrls, setImageUrls] = React.useState([]);
  const [currentImage, setCurrentImage] = React.useState(0);

  React.useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
    })();

    if (imageUrls.length === 3) {
      navigation.navigate('ImageDisplay', { imageUrls });
    }
  }, [imageUrls]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setCurrentImage(0);
      setImageUrls([]);
    });

    return unsubscribe;
  }, [navigation]);

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
    if (currentImage === 0 || currentImage === 2) {
      return <Image source={require('./assets/adaptive-icon.png')} style={styles.overlayImage} />;
    } else if (currentImage === 1) {
      return <Image source={require('./assets/splash.png')} style={styles.overlayImage} />;
    }
    return null;
  };

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCurrentImage(currentImage + 1);
      const asset = await MediaLibrary.createAssetAsync(photo.uri);
      // alert(photo.uri);
      // console.log(photo.uri);
      setImageUrls([...imageUrls, asset.uri]);
    }
  };

  return (
    <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          {renderOverlayImage()}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.text}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
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
    top: '50%',
    left: '50%',
    width: 100,
    height: 100,
    transform: [{ translateX: -50 }, { translateY: -50 }],
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
});
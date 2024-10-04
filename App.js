import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as React from "react";
import ImageDisplayScreen from './ImageDisplayScreen'; // Import the new screen

const Stack = createStackNavigator();

function CameraScreen({ navigation }) {
  const [facing, setFacing] = React.useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const cameraRef = React.useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = React.useState(null);
  const [image, setImage] = React.useState(null);
  const [imageUrls, setImageUrls] = React.useState([]);

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

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      const asset = await MediaLibrary.createAssetAsync(photo.uri);
      setImage(photo.uri);
      // alert(photo.uri);
      // console.log(photo.uri);
      setImageUrls([...imageUrls, asset.uri]);
    }
  };

  const goBack = () => {
    setImage(null);
  };

  return (
    <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.grid}>
            <View style={styles.horizontalLine} />
            <View style={[styles.horizontalLine, { top: '66.67%' }]} />
            <View style={styles.verticalLine} />
            <View style={[styles.verticalLine, { left: '66.67%' }]} />
          </View>
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
  grid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalLine: {
    position: 'absolute',
    top: '33.33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33.33%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
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
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
  },
});
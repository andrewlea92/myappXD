import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, Vibration, TextInput, Modal, ScrollView, Dimensions } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as React from "react";
import ImageDisplayScreen from './ImageDisplayScreen'; // Import the new screen
import ProcessedImagesScreen from './ProcessedImagesScreen';
import ResultScreen from './ResultScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { MaterialIcons } from '@expo/vector-icons';
import { generateAiOverlay } from './AiApiHandler';
import { debugOverlay, debugMode } from './DebugApiHandler';
import Slider from '@react-native-community/slider';
import { PanGestureHandler } from 'react-native-gesture-handler';
import * as ImageManipulator from 'expo-image-manipulator';

import CoverScreen from './CoverScreen';
import VibratingButton from './components/VibratingButton'



const Stack = createStackNavigator();
const { width, height } = Dimensions.get('window');
const aspectRatio = width / height; // 獲取設備的寬高比
const squareSize = height * (1 / aspectRatio); // 設定為 y*y

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
  const [overlayOpacity, setOverlayOpacity] = React.useState(0.5); // State to control overlay opacity
  const [foodInput, setFoodInput] = React.useState(''); // State to manage food input
  const [isModalVisible, setIsModalVisible] = React.useState(false); // 管理彈窗狀態

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


  const renderOverlayImages = () => {
    return (
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16} // Ensure smooth scrolling
      >
        {overlayImages.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image
              source={image}
              style={[styles.overlayImage, { opacity: overlayOpacity }]}
              resizeMode="contain"
              pointerEvents="none" // This ensures that the image doesn't block interactions
            />
          </View>
        ))}
      </ScrollView>
    );
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setShownOverlayImageIdx(currentIndex);
  };


  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      setLoading(true); // 立即顯示 loading
      try {
        const photo = await cameraRef.current.takePictureAsync();
        const squareSize = photo.width; // 使用拍攝的照片寬度作為裁剪大小
        const { uri, width, height } = photo;

        // 計算裁剪的起始點，確保不超出邊界
        const originX = Math.max(0, (width - squareSize) / 2);
        const originY = Math.max(0, (height - squareSize) / 2);

        // 使用 ImageManipulator 進行裁剪
        const croppedImage = await ImageManipulator.manipulateAsync(
          uri,
          [
            {
              crop: {
                originX: originX,
                originY: originY,
                width: squareSize,  // 確保寬度設置為正中間裁剪區域的大小
                height: squareSize, // 確保高度設置為正中間裁剪區域的大小
              },
            },
          ],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        setImageCount(imageCount + 1);
        setImageUrls([...imageUrls, croppedImage.uri]);
      } catch (error) {
        console.error("拍照或裁剪過程中出現錯誤:", error);
      } finally {
        setLoading(false); // 確保 loading 被隱藏
      }
    }
  };




  const handleAiOverlay = async () => {
    if (cameraRef.current) {
      setTimeout(() => setLoading(true), 250); // Show after blinking effect with delay
      const photo = await cameraRef.current.takePictureAsync();

      setOverlayOpacity(0.5)
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

      //! Remove foodInput after overlay generation
      setFoodInput("")

      console.log('AI 覆蓋 button pressed');
    }
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {overlayImages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === shownOverlayImageIdx ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>

        {/* 上方灰階遮罩 */}
        <View style={styles.top_overlay} >
          {/* 放置在上方灰階遮罩中的元素 */}
          <View style={styles.upUICaontainer}>
            <Bar
              style={{ width: '100%' }}
              progress={imageCount / 3}
              width={width}
              height={10}
              borderWidth={0}
              color={'black'}
              animationType='spring'
              backgroundColor={'#e0e0df'}
            />
            {/* <GradientProgressBar progress={imageCount / 3} /> */}
          </View>
        </View>

        {/* 中間正方形可視區域 */}
        <View style={styles.squareFocusArea}>
          {loading && <ActivityIndicator size="large" color="#000" style={styles.loadingIndicator} />}
          {renderOverlayImages()}
        </View>

        {/* 下方灰階遮罩 */}
        <View style={styles.bottom_overlay}>

          {/* 底部的點點 */}
          {renderDots()}

          {/* 底部的滑動條 */}
          <View style={overlayImages.length ? styles.sliderContainer : styles.hiddenSliderContainer}>
            <View style={styles.sliderRow}>
              <MaterialIcons name="opacity" size={30} color="black" />
              {/* <Text style={styles.sliderLabel}>Overlay Opacity</Text> */}
              <Slider

                disabled={overlayImages.length ? false : true}
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={overlayOpacity}
                onValueChange={setOverlayOpacity}
                minimumTrackTintColor="#000"
                maximumTrackTintColor="#ccc"
                thumbTintColor="#fff"

              />
            </View>
          </View>

          {/* 放置在下方灰階遮罩中的按鈕 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.circleButton} onPress={toggleCameraFacing}>
              <Icon name="refresh" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleButton} onPress={takePicture} disabled={loading}>
              <Icon name="camera" size={30} color="white" />
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.circleButton} onPress={handleAiOverlay} disabled={loading}>
              <Icon name="magic" size={30} color="white" />
            </TouchableOpacity> */}

            {/* This Button Can Vibrate! */}
            <VibratingButton icon_name={"magic"} size={30} handleFunc={handleAiOverlay} disabled={loading} />
          </View>
        </View>

      </CameraView>



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
      <Stack.Navigator
        initialRouteName="Cover"
        screenOptions={{
          headerStyle: { backgroundColor: '#000' }, // 設置標題欄背景顏色
          headerTintColor: '#fff', // 設置標題文字顏色
          headerTitleStyle: { fontWeight: 'bold' }, // 設置標題文字樣式
        }}
      >
        <Stack.Screen name="Cover" component={CoverScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ImageDisplay" component={ImageDisplayScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ProcessedImages" component={ProcessedImagesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ headerShown: false }} />
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
    ...StyleSheet.absoluteFillObject,

  },
  overlayImage: {
    //position: 'absolute',
    resizeMode: 'contain',
    width: '100%',
    height: '100%',
    //top: 0,
    //left: 0,
  },
  emptyOverlayImage: {
    width: 0,
    height: 0,
    opacity: 0,
  },
  top_overlay: {
    width: '100%',
    height: (height - width) / 2 - 40, // 調整上方和下方的灰階遮罩高度
    backgroundColor: 'white',
    opacity: 1,
  },
  bottom_overlay: {
    width: '100%',
    height: (height - width) / 2 + 40, // 調整上方和下方的灰階遮罩高度
    backgroundColor: 'white',
    opacity: 1,
  },
  squareFocusArea: {
    width: '100%',
    height: width, // 中間正方形可視區域
    justifyContent: 'center',
    alignItems: 'center',
    // borderColor: 'white',
    // borderWidth: '10%',
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
    backgroundColor: '#000',
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
    top: '45%',
    left: '5%',
    fontSize: 36,
    fontWeight: 'bold',
    color: 'black',
  },
  loadingIndicator: {
    position: 'absolute',
    top: '45%',
    left: '46%',
    // transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  hiddenSliderContainer: {
    display: 'none',
    position: 'absolute',
    // top: '50%',
    // right: 50, // 將 right 屬性調整為 10，向左移動
    // transform: [{ rotate: '-90deg' }, { translateY: -150 }],
    // width: 300,
    bottom: '55%',  // 將滑動條放置在距離螢幕底部 30 像素的位置
    left: '10%',
    right: 0,    // left 和 right 設置為 0 以使滑動條水平居中
    width: '80%',  // 設定寬度為 80% 讓滑動條佔據螢幕的 80%
    height: 100,
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
  },
  sliderContainer: {
    position: 'absolute',
    justifyContent: 'center',
    height: 100,
    width: '80%',  // 設定寬度為 80% 讓滑動條佔據螢幕的 80%
    bottom: '55%',  // 將滑動條放置在距離螢幕底部 30 像素的位置
    left: '10%',
    right: 0,    // left 和 right 設置為 0 以使滑動條水平居中
    padding: 10,
    borderRadius: 10,
  },
  sliderRow: {
    flexDirection: 'row',  // Align items horizontally
    alignItems: 'center',  // Vertically center the items
    margin: 0,
    justifyContent: 'space-between',  // Adjust spacing between Text and Slider
  },
  sliderLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    // textAlign: 'center',
  },
  slider: {
    // width: '100%',
    flex: 1,
    height: 40,
    marginLeft: 10,
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
    backgroundColor: '#000',
    borderRadius: 5,
  },
  openModalButton: {
    position: 'absolute',
    top: '40%',
    right: '5%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
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
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '2%', // Ensure distance from squareFocusArea
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: 'black',
  },
  inactiveDot: {
    backgroundColor: '#D3D3D3',
  },
  scrollView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: width, // Ensure each image takes up the full width of the screen
    justifyContent: 'center',
    alignItems: 'center',
  },
});
import React, { useState, useRef } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, Clipboard, Alert, ScrollView, Dimensions, Modal, Animated } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
// import Clipboard from '@react-native-clipboard/clipboard';
import { LogBox } from 'react-native';
import { debugMode } from './DebugApiHandler';
import Icon from 'react-native-vector-icons/FontAwesome';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
LogBox.ignoreAllLogs(); // for suppressing clipboard warning

import Dots from './components/Dots';

const { width, height } = Dimensions.get('window');

// Function to save Base64 image to Media Library
const saveImageToMediaLibrary = async (base64DataUrl) => {
  let fileUri;
  if (debugMode) {
    console.log(base64DataUrl);
    fileUri = base64DataUrl;
  } else {
    fileUri = `${FileSystem.documentDirectory}photo_${Date.now()}.jpg`;

    // Extract the Base64 string from the data URL
    const base64Image = base64DataUrl.split(',')[1];

    // Write the Base64 image to a file
    await FileSystem.writeAsStringAsync(fileUri, base64Image, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  // Save the file to the media library
  const asset = await MediaLibrary.createAssetAsync(fileUri);
  // await MediaLibrary.createAlbumAsync('FoodgramAI', asset, false);
  console.log('Saved to:', fileUri);

  return fileUri;
};

export default function ResultScreen({ route, navigation }) {
  const { processedUrls, aiText } = route.params;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const [currentPage, setCurrentPage] = useState(0);

  const handlePressIn = () => {
    console.log('press in');
    Animated.spring(scaleAnim, {
      toValue: 2, // Scale down to 80%
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1, // Scale back to original size
      useNativeDriver: true,
    }).start();
  };

  const saveToAlbum = async () => {
    try {
      for (const base64DataUrl of processedUrls) {
        await saveImageToMediaLibrary(base64DataUrl);
      }
      Alert.alert('已成功儲存至手機');
    } catch (error) {
      Alert.alert('儲存至手機失敗');
      console.error(error);
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(aiText);
  };

  const handleGesture = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationX > 50) {
        navigation.goBack(); // Navigate to the previous screen
      }
    }
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentPage = Math.floor(contentOffsetX / width);
    setCurrentPage(currentPage);
  };


  return (
    <PanGestureHandler onHandlerStateChange={handleGesture}>
      <View style={styles.background}>
        <ScrollView
          pagingEnabled
          contentContainerStyle={styles.allScrollView}>
          <View style={{ height: '50%', width: '100%', alignItems: 'center' }}>
            <Text style={styles.title}>Image</Text>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageScrollView}
              onScroll={handleScroll}
              scrollEventThrottle={16}>
              {processedUrls.map((url, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image
                    key={index}
                    source={{ uri: url }}
                    style={styles.image}
                  />
                </View>
              ))}
            </ScrollView>
            
            <Dots activeIdx={currentPage} totalIdx={processedUrls.length}/>

            <View style={styles.toolbar}>
              <TouchableOpacity
                style={styles.circleButton}
                onPress={saveToAlbum}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}>
                <Icon name="download" size={30} color="white" />
              </TouchableOpacity>
            </View>
            <Image source={require('./assets/arrow.png')} style={{ width: 60, height: 60, bottom: '3%' }} />
          </View>

          {/* // this is the text part */}
          <View style={{ height: '50%', width: '100%' }}>
            <Text style={styles.title}>Copy the text</Text>
            <ScrollView
              horizontal={false}
              contentContainerStyle={styles.aiTextScrollView}>
              <Text style={styles.aiText}>{aiText}</Text>
            </ScrollView>

            <View style={styles.toolbar}>
              <TouchableOpacity
                style={styles.circleButton}
                onPress={copyToClipboard}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}>
                <Icon name="copy" size={'30%'} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

      </View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  background: {
    width: width,
    height: height,
    color: 'white'
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '15%',
    height: '10%',
    width: '100%',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    marginTop: '20%',
  },
  allScrollView: {
    width: width,
    height: 2 * height,
  },
  imageScrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '5%',
    // paddingBottom: '5%',
    width: width * 3,
    height: '90%',
  },
  imageContainer: {
    alignItems: 'center',
    width: width,
    height: '100%',
    paddingLeft: 10,
    paddingRight: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 15
  },
  toolbar: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '20%',
    width: '100%',
    marginBottom: '20%'
  },
  button: {
    backgroundColor: 'black',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    height: '40%'
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  aiTextScrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '5%',
    paddingBottom: '5%',
    margin: '5%',
    height: '90%',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 20,
  },
  aiText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  circleButton: {
    width: 60,
    height: 60,
    bottom: '20%',
    borderRadius: 30,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: '2%', // Ensure distance from squareFocusArea
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
});
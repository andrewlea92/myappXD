import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView, Dimensions, ActivityIndicator, Animated } from 'react-native';
import { generateAiProcessedImage } from './AiApiHandler';
import { debugProcessedImage, debugMode } from './DebugApiHandler';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

export default function ImageDisplayScreen({ route, navigation }) {
  const { imageUrls } = route.params;
  const [processedUrls, setProcessedUrls] = useState([]);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // Add state for alert
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [currentPage, setCurrentPage] = useState(0);


  useEffect(() => {
    if (showAlert) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Fade out after 3 seconds
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => setShowAlert(false));
        }, 3000);
      });
    }
  }, [showAlert]);
  const handleAiEdit = async () => {
    console.log("imageUrls", imageUrls);
    setLoading(true);
    let processed = [];
    // Simulate uploading images to an external API and receiving processed images
    if (debugMode) {
      processed = await debugProcessedImage(imageUrls);
      console.log('Processed URLs:', processed);
    }
    else {
      processed = await generateAiProcessedImage(imageUrls);
    }
    setProcessedUrls(processed);
    setShowNextButton(true);
    setShowAlert(true); // Show alert
    setLoading(false);
    console.log('AI 修圖 button pressed');
  };

  const handleNextStep = () => {
    // Navigate to the ProcessedImagesScreen
    navigation.navigate('ProcessedImages', { processedUrls });
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

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
      {(processedUrls.length > 0 ? processedUrls : imageUrls).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentPage ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
      </View>
    );
  };

  return (
    <PanGestureHandler onHandlerStateChange={handleGesture}>
      <View style={styles.background}>
        <Text style={styles.title}>Image</Text>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollView}
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          {(processedUrls.length > 0 ? processedUrls : imageUrls).map((url, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                key={index}
                source={{ uri: url }}
                style={styles.image}
              />
            </View>
          ))}
        </ScrollView>
        {renderDots()}
        <View style={styles.alertContainer}>
          {showAlert && (
            <Animated.Text style={{ ...styles.alertText, opacity: fadeAnim }}>AI 修圖完畢!</Animated.Text>
          )}
        </View>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.button} onPress={handleAiEdit}>
            <Text style={styles.buttonText}>AI 修圖</Text>
          </TouchableOpacity>
          {showNextButton && (
            <TouchableOpacity style={styles.nextStepButton} onPress={handleNextStep}>
              <Text style={styles.nextStepsText}>下一步</Text>
            </TouchableOpacity>
          )}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator

                size="large" color="#0000ff" />
            </View>
          )}
        </View>
      </View >
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
  backButton: {
    left: '25%',
    height: '75%',
    width: '10%',
  },
  backImage: {
    height: '50%',
    width: '100%'
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '5%',
    paddingBottom: '5%',
    width: width * 3,
    height: '100%',
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
  urlText: {
    marginTop: 5,
    fontSize: 12,
    color: 'gray',
  },
  toolbar: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '20%',
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
  nextStepButton: {
    backgroundColor: 'transparent',
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
  nextStepsText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  alertContainer: {
    height: '10%',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Slight gray background
    justifyContent: 'center',
    alignItems: 'center',
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
});
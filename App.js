// import { CameraView, useCameraPermissions } from 'expo-camera';
// import { useState } from 'react';
// import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
// import React, { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as React from "react";
// import { CameraType } from 'expo-camera/build/Camera. types';

export default function App() {
  const [facing, setFacing] = React.useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const cameraRef = React.useRef<CameraView>(null);
  const [hasCameraPermission, setHasCameraPermission] = React.useState(null);
  const [camera, setCamera] = React.useState(null);
  const [image, setImage] = React.useState(null);
  // const [type, setType] = useState(Camera.Constants.Type.back);

  React.useEffect(() => {
    (async () => {
    const cameraStatus = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(cameraStatus.status === 'granted' );
    })();
  }, []);

  if(hasCameraPermission === false){
    return <View />;
  }

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
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
    alert('Taking photo...');
    if(camera){
        const photo = await cameraRef.current.takePictureAsync();
        setImage(photo.uri);
        alert(' photo...');
      }
  };

  // const [picture, setPicture] = React.useState<string>(
  //   "https://picsum.photos/seed/696/3000/2000"
  //   ); // "https://picsum.photos/seed/696/3000/2000"
    
  //   async function handleTakePicture() {
  //   const response = await cameraRef.current ?. takePictureAsync({});
  // }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        九宮格線條

        {/* camera */}
        {/* <camera ref={ref => setCamera(ref)} 
          style={styles.fixedratio} 
          // type={type} 
          ratio = {'1:1'}
          /> */}

        <View style={styles.grid}>
          {/* 橫線 */}
          <View style={styles.horizontalLine} />
          <View style={[styles.horizontalLine, { top: '66.67%' }]} />

          {/* 縱線 */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  fixedratio: {
    flex: 1,
    aspectRatio: 1
  },
  grid: {
    ...StyleSheet.absoluteFillObject, // 佔滿整個相機畫面
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalLine: {
    position: 'absolute',
    top: '33.33%', // 第一條橫線
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // 白色半透明
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33.33%', // 第一條縱線
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // 白色半透明
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

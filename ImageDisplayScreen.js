import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function ImageDisplayScreen({ route }) {
  const { imageUrls } = route.params;

  return (
    <View style={styles.container}>
      {imageUrls.map((url, index) => (
        <Image key={index} source={{ uri: url }} style={{ width: 250, height: 250 }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
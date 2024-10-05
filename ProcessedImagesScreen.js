import React from 'react';
import { View, Image, StyleSheet, TextInput, ScrollView, Text } from 'react-native';

export default function ProcessedImagesScreen({ route }) {
  const { processedUrls } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {processedUrls.map((url, index) => (
        <View key={index} style={styles.imageContainer}>
          <Image source={{ uri: url }} style={styles.image} />
          <Text style={styles.urlText}>{url.slice(-15)}</Text>
        </View>
      ))}
      <TextInput style={styles.input} placeholder="Enter text here" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 250,
    height: 250,
  },
  urlText: {
    marginTop: 5,
    fontSize: 12,
    color: 'gray',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginTop: 20,
  },
});
const nthu_drom_backend = 'http://192.168.0.104:5000';
const my_home_backend = 'http://192.168.50.74:5000';
const ngrok_backend = 'https://on-hamster-prepared.ngrok-free.app';
const backend_root = ngrok_backend;

export const generateAiOverlay = async (imageUri, category) => {
  // Function to upload the image to the backend
  const uploadImageToBackend = async (imageUri) => {
    const timestamp = Date.now(); // Get current timestamp
  
    // Create FormData to send the image to the backend
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri, // Image URI
      name: `photo_${timestamp}.jpg`, // Use timestamp for the image name
      type: 'image/jpeg' // MIME type
    });
    
    // Send POST request to the Python backend
    try {
      const response = await fetch(`${backend_root}/save_image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json', // Accept header for JSON response
        }
      });
  
      const responseData = await response.json();
      console.log('Response from server:', responseData);
      return responseData.file_path; // Return the file path from the response
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error; // Re-throw error to handle it in the calling function
    }
  };

  // Function to get the overlay image from the backend
  const getOverlayImageFromBackend = async (filePath, category) => {
    try {
      const response = await fetch(`${backend_root}/get_overlay_image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ file_path: filePath, category: category })
      });
      const data = await response.json();
      const overlayImageFilePaths = data.overlay_image_file_paths;
      console.log('Overlay images from server:', overlayImageFilePaths);
      return overlayImageFilePaths; // Return array of file paths
    }
    catch (error) {
      console.error('Error getting overlay image:', error);
      throw error; // Re-throw error to handle it in the calling function
    }
  };

  const filePath = await uploadImageToBackend(imageUri); // Upload the image to the backend

  const overlayImageFilePaths = await getOverlayImageFromBackend(filePath, category); // Get the overlay image from the server
  
  const imageMapping = {
    './assets/ig/拉麵_1.jpg': require('./assets/ig/拉麵_1.jpg'),
    './assets/ig/拉麵_2.jpg': require('./assets/ig/拉麵_2.jpg'),
    './assets/ig/拉麵_3.jpg': require('./assets/ig/拉麵_3.jpg'),
    './assets/ig/火鍋_1.jpg': require('./assets/ig/火鍋_1.jpg'),
    './assets/ig/火鍋_2.jpg': require('./assets/ig/火鍋_2.jpg'),
    './assets/ig/火鍋_3.jpg': require('./assets/ig/火鍋_3.jpg'),
    './assets/ig/燒肉_1.jpg': require('./assets/ig/燒肉_1.jpg'),
    './assets/ig/燒肉_2.jpg': require('./assets/ig/燒肉_2.jpg'),
    './assets/ig/燒肉_3.jpg': require('./assets/ig/燒肉_3.jpg'),
    './assets/ig/甜點_1.jpg': require('./assets/ig/甜點_1.jpg'),
    './assets/ig/甜點_2.jpg': require('./assets/ig/甜點_2.jpg'),
    './assets/ig/甜點_3.jpg': require('./assets/ig/甜點_3.jpg'),
    './assets/ig/甜點_4.jpg': require('./assets/ig/甜點_4.jpg'),
    './assets/ig/甜點_5.jpg': require('./assets/ig/甜點_5.jpg'),
    './assets/ig/甜點_6.jpg': require('./assets/ig/甜點_6.jpg'),
    './assets/ig/甜點_7.jpg': require('./assets/ig/甜點_7.jpg'),
    './assets/ig/甜點_8.jpg': require('./assets/ig/甜點_8.jpg'),
    './assets/ig/甜點_9.jpg': require('./assets/ig/甜點_9.jpg'),
    './assets/ig/西餐_1.jpg': require('./assets/ig/西餐_1.jpg'),
    './assets/ig/西餐_2.jpg': require('./assets/ig/西餐_2.jpg'),
    './assets/ig/西餐_3.jpg': require('./assets/ig/西餐_3.jpg'),
  };

  const selectedOverlayImages = overlayImageFilePaths.map((overlayImageFilePath) => imageMapping[overlayImageFilePath]);

  return selectedOverlayImages; // Return the selected overlay images
};

export const generateAiProcessedImage = async (imageUrls) => {
  // Function to upload the image to the backend
  const uploadImageToBackend = async (imageUri) => {
    const timestamp = Date.now(); // Get current timestamp
  
    // Create FormData to send the image to the backend
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri, // Image URI
      name: `photo_${timestamp}.jpg`, // Use timestamp for the image name
      type: 'image/jpeg' // MIME type
    });
    
    // Send POST request to the Python backend
    try {
      const response = await fetch(`${backend_root}/save_image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json', // Accept header for JSON response
        }
      });
  
      const responseData = await response.json();
      console.log('Response from server:', responseData);
      return responseData.file_path; // Return the file path from the response
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error; // Re-throw error to handle it in the calling function
    }
  };

  // Helper function to convert Blob to Base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Function to get processed images from the backend
  const getProcessedImageFromBackend = async (filePath) => {
    try {
      const response = await fetch(`${backend_root}/get_processed_image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ file_path: filePath })
      });
      const blob = await response.blob();
      const base64Image = await blobToBase64(blob); // Convert Blob to Base64
      console.log('Processed image from server:', base64Image.substring(0, 100));
      return `data:image/jpeg;base64,${base64Image}`; // Return Base64 data URL
    } catch (error) {
      console.error('Error getting processed image:', error);
      throw error; // Re-throw error to handle it in the calling function
    }
  };
  
  const processedImageUrls = []; // List to store processed image URLs

  for (const url of imageUrls) {
    const filePath = await uploadImageToBackend(url); // Upload each image to the backend

    const processedImageUrl = await getProcessedImageFromBackend(filePath); // Get the processed image from the server

    processedImageUrls.push(processedImageUrl); // Add the processed image URL to the list
  }

  return processedImageUrls; // Return the list of processed image URLs
};

export const generateAiCaption = async (storeName, items, review) => {
  // Function to get caption from the backend
  const getCaptionFromBackend = async (storeName, items, review) => {
    try {
      const response = await fetch(`${backend_root}/get_caption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ storeName, items, review })
      });
      const responseData = await response.json();
      console.log('Caption from server:', responseData);
      return responseData.caption; // Assuming the caption is in responseData.caption
    }
    catch (error) {
      console.error('Error getting caption:', error);
      throw error; // Re-throw error to handle it in the calling function
    }
  }

  return getCaptionFromBackend(storeName, items, review); // Get the caption from the server
};

export const generateAiCaptionWithAudio = async (recordedUrl) => {
  // Function to upload the audio (m4a) to the backend
  const uploadAudioToBackend = async (audioUri) => {
    const timestamp = Date.now(); // Get current timestamp

    // Create FormData to send the audio to the backend
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri, // Audio URI
      name: `audio_${timestamp}.m4a`, // Use timestamp for the audio name
      type: 'audio/x-m4a' // MIME type for m4a audio
    });

    // Send POST request to the Python backend
    try {
      const response = await fetch(`${backend_root}/save_audio`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json', // Accept header for JSON response
        }
      });

      const responseData = await response.json();
      console.log('Response from server:', responseData);
      return responseData.file_path; // Return the file path from the response
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw error; // Re-throw error to handle it in the calling function
    }
  };
  
  // Function to get caption from the backend with an audio file path
  const getCaptionFromBackendWithAudio = async (audioFilePath) => {
    try {
      // Send request to backend to process the audio file and get a caption
      const response = await fetch(`${backend_root}/get_caption_from_audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ file_path: audioFilePath }) // Pass the audio file path to backend
      });
      
      const responseData = await response.json();
      console.log('Caption from server:', responseData.caption); // Log the caption received
      return responseData.caption; // Return the caption from the server's response
    } 
    catch (error) {
      console.error('Error getting caption from audio:', error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  };

  const filePath = await uploadAudioToBackend(recordedUrl); // Upload the audio to the backend

  return getCaptionFromBackendWithAudio(filePath); // Get the caption from the server
};
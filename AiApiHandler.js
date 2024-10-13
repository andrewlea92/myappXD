const nthu_drom_backend = 'http://192.168.0.101:5000';
const my_home_backend = 'http://192.168.50.74:5000';
const backend_root = my_home_backend;

export const generateAiOverlay = async (imageUri) => {
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

  // Function to get the overlay number from the backend
  const getOverlayNumberFromBackend = async (filePath) => {
    try {
      const response = await fetch(`${backend_root}/get_overlay_number`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ file_path: filePath })
      });
      const responseData = await response.json();
      console.log('Overlay number from server:', responseData);
      return responseData.number; // Assuming the number is in responseData.number
    } catch (error) {
      console.error('Error getting overlay number:', error);
      throw error; // Re-throw error to handle it in the calling function
    }
  };

  // Upload the image first
  const filePath = await uploadImageToBackend(imageUri); // Upload the captured image and get the file path

  // Get the overlay number from the server
  const overlayNumber = await getOverlayNumberFromBackend(filePath); // Get the overlay number from the server

  // Load the corresponding image based on the overlay number
  const overlayImages = [
    require('./assets/milk/1.png'),
    require('./assets/milk/2.png'),
    require('./assets/milk/3.png'),
    require('./assets/milk/4.png'),
    require('./assets/milk/5.png'),
    require('./assets/milk/6.png'),
    require('./assets/milk/7.png'),
  ];
  const selectedOverlayImage = overlayImages[(overlayNumber - 1) % overlayImages.length]; // Select the image based on the number
  // overlayNumber is 1-based index

  return selectedOverlayImage; // Return the selected overlay image
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

export const generateAiCaption = async (text) => { // it can be called generateAiCaption
  // Function to get caption from the backend
  const getCaptionFromBackend = async (text) => {
    try {
      const response = await fetch(`${backend_root}/get_caption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ text: text })
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

  return getCaptionFromBackend(text); // Get the caption from the server
};
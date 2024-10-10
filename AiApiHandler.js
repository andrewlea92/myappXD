export const simulateAiOverlay = async (imageUri) => {
  // Function to fetch a random number from the backend
  const fetchRandomNum = async () => {
    try {
      const response = await fetch('http://192.168.0.101:5000/random-number');
      const data = await response.json();
      return data.random_number; // Return the random number
    } catch (error) {
      console.error('Error fetching random number:', error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  };

  // Function to upload the image to the backend
  const uploadImage = async (imageUri) => {
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
      const response = await fetch('http://192.168.0.101:5000/upload-image', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json', // Accept header for JSON response
        }
      });
  
      const data = await response.json();
      console.log('Response from server:', data);
      return data; // Return response data if needed
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error; // Re-throw error to handle it in the calling function
    }
  };  

  // Upload the image first
  await uploadImage(imageUri); // Upload the captured image

  // Fetch the random number after uploading the image
  const randomNum = await fetchRandomNum();

  // Load the corresponding image based on the random number
  const images = [
    require('./assets/pose/1.png'),
    require('./assets/pose/2.png'),
    require('./assets/pose/3.png'),
  ];
  const randomImage = images[randomNum];

  return randomImage; // Return the selected overlay image
};

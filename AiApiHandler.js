export const simulateAiOverlay = async () => {
  const fetchRandomNum = async () => {
    try {
      const response = await fetch('http://192.168.0.101:5000/random-number');
      const data = await response.json();
      const images = [
        require('./assets/pose/1.png'),
        require('./assets/pose/2.png'),
        require('./assets/pose/3.png'),
      ];
      const randomImage = images[data.random_number];
      return randomImage;
    } catch (error) {
      console.error('Error fetching random number:', error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  };

  return await fetchRandomNum();
};
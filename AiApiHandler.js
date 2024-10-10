export const simulateAiOverlay = async () => {
  // Simulate a delay for the AI overlay generation
  await new Promise(resolve => setTimeout(resolve, 1000));

  const images = [
    require('./assets/pose/1.png'),
    require('./assets/pose/2.png'),
    require('./assets/pose/3.png'),
  ];
  const randomImage = images[Math.floor(Math.random() * images.length)];

  // Simulate the AI overlay image (in a real scenario, this would be returned by the API)
  return randomImage;
}

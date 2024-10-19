export const debugMode = false; // Set this to true for debug modeconst debugMode = true; // Set this to true for debug mode

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

const getRandomImages = (images, count) => {
  const imageArray = Object.values(images); // Convert dictionary values to an array
  const shuffled = imageArray.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const debugOverlay = async (imageUri, category) => {
    console.log('Debug mode enabled for Overlay');
    return getRandomImages(imageMapping, 3); // Return 3 random images for debug mode
};

export const debugProcessedImage = async (imageUrls) => {
    const processedUrls = imageUrls.map(url => url); // Return base64 encoded URLs for debug mode
    return processedUrls; // Return the list of processed 
};

export const debugCaption = async (storeName, items, review) => {
    return `Debug caption for debugCaption`; // Return a mock caption for debug mode
};

export const debugCaptionWithAudio = async (recordedUrl) => {
    return `Debug caption for audio at ${recordedUrl}`; // Return a mock caption for debug mode

};


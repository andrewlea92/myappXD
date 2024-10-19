# Install project and setup git guide
1. have npm already

2. npm install -g expo-cli

https://docs.expo.dev/tutorial/create-your-first-app/

!! No chinese path

first time (in git shell): create empty project directory and then dump lea's git things into the directory

3. npx create-expo-app Blank --template blank

4. rm -rf Blank/.git

5. git clone https://github.com/andrewlea92/myappXD.git temp

6. mv temp/.git Blank/.git

7. mv temp/* Blank/

8. rm -rf temp

9. cd Blank

10. npm install expo-camera expo-media-library

11. npx expo start

-> turns out you have to be under same internet 

later: npx expo start

### git shell - all in one paste
```
npx create-expo-app Blank --template blank
rm -rf Blank/.git

git clone https://github.com/andrewlea92/myappXD.git temp
mv temp/.git Blank/.git
mv temp/* Blank/
rm -rf temp

cd Blank
# Install below packages! See next section
npx expo start

```

## Used packages
```
npm install expo-camera expo-media-library
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated
npm install @react-native-community/slider


# ask ma's packagejson and feed to chatgpt to npm install everything
```



## Used packages (these are the real used packages)
```
npm install expo-camera expo-media-library expo-image-manipulator expo-status-bar
npm install @react-navigation/native @react-navigation/stack
npm install @react-native-community/slider
npm install react-native-screens react-native-safe-area-context
npm install expo-av

// 2024-10-19 14:00 update
npm install react-native-ratings
```
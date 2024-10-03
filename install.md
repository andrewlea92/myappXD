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
npm install expo-camera expo-media-library
npx expo start

```
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const title = 'Foodgram AI';

const colorMap = ['#EA4335', '#FBBC05', '#34A853', '#4285F4']

function CoverScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity value is 0
    const charAnims = useRef(title.split('').map(() => new Animated.Value(0))).current; // Initial values for each character

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1, // Animate to opacity: 1 (fully visible)
            duration: 750, // Duration of the animation
            useNativeDriver: true, // Use native driver for better performance
        }).start(() => {
            charAnims.forEach((anim, index) => {
                Animated.timing(anim, {
                    toValue: 1, // Animate to final color
                    duration: 250, // Duration of the animation
                    delay: index * 50, // Stagger the animations
                    useNativeDriver: false, // Color animation does not support native driver
                }).start(() => {
                    // Navigate to 'Camera' screen after all animations complete
                    if (index === charAnims.length - 1) {
                        navigation.navigate('Camera');
                    }
                });
            })
        }
        );
    }, [fadeAnim, charAnims, navigation]);

    return (
        <Animated.View style={{
            ...styles.container,
            opacity: fadeAnim, // Bind opacity to animated value
        }}>
            {title.split('').map((char, index) => (
                <Animated.Text
                    key={index}
                    style={{
                        ...styles.text,
                        color: charAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: ['#000000', colorMap[Math.floor(index / title.length * colorMap.length)]], // Change from black to red
                        }),
                    }}
                >
                    {char}
                </Animated.Text>
            ))}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default CoverScreen; 
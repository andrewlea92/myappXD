import React from 'react';
import { TouchableOpacity, Vibration, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const VibratingButton = ({icon_name, size, disabled, handleFunc}) => {
  const handlePress = () => {
    Vibration.vibrate();  // Trigger vibration on button press
    // Add other functionality here, like toggling camera facing
    handleFunc()
  };

  return (
    <TouchableOpacity style={styles.circleButton} onPress={handlePress} disabled={disabled}>
      <Icon name={icon_name} size={size} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    circleButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        alignItems: 'center',
        marginHorizontal: 10,
      },
})

export default VibratingButton;
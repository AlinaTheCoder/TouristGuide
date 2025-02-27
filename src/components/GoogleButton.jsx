import React, { useState } from 'react';
import { TouchableOpacity, Text, Image, StyleSheet } from 'react-native';


const GoogleButton = ({ onPress }) => {
  const [isPressed, setIsPressed] = useState(false); // State to track button press


  const handlePressIn = () => {
    setIsPressed(true); // Set state to true on button press
  };


  const handlePressOut = () => {
    setIsPressed(false); // Reset state to false when button is released
    if (onPress) onPress(); // Call the provided onPress function
  };


  return (
    <TouchableOpacity
      style={[styles.googleButton, isPressed && styles.pressedButton]}
      onPressIn={handlePressIn} // Detect press start
      onPressOut={handlePressOut} // Detect press release
    >
      <Image
        source={require('../icons/google.png')}
        style={styles.googleIcon}
      />
      <Text style={styles.googleButtonText}>Login with Google</Text>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  googleButton: {
    flexDirection: 'row',
    width: '82%',
    height: 50,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc', // Default border color
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  pressedButton: {
    borderColor: '#000000', // Change border color to black when pressed
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 20,
  },
  googleButtonText: {
    color: '#666',
    fontSize: 18,
  },
});

export default GoogleButton;
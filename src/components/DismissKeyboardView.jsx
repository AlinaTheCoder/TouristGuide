// src/components/DismissKeyboardView.jsx
import React from 'react';
import { Keyboard, TouchableWithoutFeedback, View, StyleSheet } from 'react-native';

const DismissKeyboardView = ({ children, style }) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => Keyboard.dismiss()} // Dismiss keyboard on tap
      accessible={false} // Ensures the view is not accessible when navigating via accessibility features
    >
      <View style={[styles.container, style]}>{children}</View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the view takes up the full screen
  },
});

export default DismissKeyboardView;

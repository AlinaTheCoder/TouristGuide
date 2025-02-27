// src/components/Footer.jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomButtonHostForm from './CustomButtonHostForm'; // Assuming CustomButtonHostForm is in the same directory

const Footer = ({ progressWidth, onNext }) => {
  return (
    <View style={styles.footer}>
      {/* Loading Bar */}
      <View style={styles.loadingBarContainer}>
        <View style={[styles.loadingBar, { width: progressWidth }]} />
      </View>

      {/* Next Button */}
      <View style={styles.nextButtonContainer}>
        <CustomButtonHostForm title="Next" onPress={onNext} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  // Loading Bar styles
  loadingBarContainer: {
    width: '100%',
    height: 5,
    backgroundColor: '#ddd', // Background color of the bar
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 8, // Adds some space above and below the bar
  },
  loadingBar: {
    height: '100%',
    backgroundColor: '#FF5A5F', // Default color for the bar
    borderRadius: 5,
  },
  nextButtonContainer: {
    alignItems: 'flex-end', // Align the button to the right
    marginTop: -5,
    marginBottom: 20, // Adds space below the footer
  },
});

export default Footer;

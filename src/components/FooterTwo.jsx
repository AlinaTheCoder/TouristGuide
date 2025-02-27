import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomButtonHostFormTwo from './CustomButtonHostFormTwo'; // Assuming CustomButtonHostForm is in the same directory

const FooterTwo = ({ progress, onNext, onBack, nextButtonText, backButtonText }) => {
  const progressWidth = `${(progress / 7) * 100}%`; // Convert progress to percentage out of 7 parts

  return (
    <View style={styles.footer}>
      {/* Loading Bar */}
      <View style={styles.loadingBarContainer}>
        <View style={[styles.loadingBar, { width: progressWidth }]} />
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonsContainer}>
        {/* Back Button */}
        <View style={styles.buttonContainer}>
          <CustomButtonHostFormTwo title={backButtonText} onPress={onBack} />
        </View>

        {/* Next Button */}
        <View style={[styles.buttonContainer, styles.buttonContainer2]}>
          <CustomButtonHostFormTwo title={nextButtonText} onPress={onNext} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  loadingBarContainer: {
    width: '100%',
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 8,
  },
  loadingBar: {
    height: '100%',
    backgroundColor: '#FF5A5F',
    borderRadius: 5,
  },
  buttonsContainer: {
    flexDirection: 'row', // Positions buttons side by side
    justifyContent: 'space-between', // Spacing between the buttons
    marginTop: 15, // Adds space between the loading bar and buttons
    marginBottom: 20, // Adds space below the footer
  },
  buttonContainer: {
    flex: 0.48, // Makes each button take almost half of the space
  },
  buttonContainer2: {
    marginEnd: -150,
  },
});

export default FooterTwo;

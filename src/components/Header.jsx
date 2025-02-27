// src/components/Header.jsx
import React from 'react';
import { Text, StyleSheet, View, Image } from 'react-native';

const Header = ({ step, title, imageSource }) => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <Image source={imageSource} style={styles.image} />
      <Text style={styles.stepText}>{step}</Text>
      <Text style={styles.titleText}>{title}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    marginTop: 30,
    marginBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',  // Align items vertically in the center
  },
  image: {
    width: 32,
    height: 32,
    marginRight: 5, // Adds space between the image and text
  },
  stepText: {
    fontSize: 14,
    color: '#888',
    marginRight: 10,  // Adds space between the step text and title
  },
  titleText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default Header;

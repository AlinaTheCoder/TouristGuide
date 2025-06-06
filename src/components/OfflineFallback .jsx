import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const OfflineFallback = ({ onRetry }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../images/internet_error.jpg")} // Ensure the image exists in assets folder
          style={styles.image}
        />
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.subtitle}>It seems there is something wrong with your internet connection. Please connect to the internet and start TOURISTGUIDE again.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 38, // Increased font size
    fontWeight: '600', // Increased font weight
    color: 'black',
    letterSpacing: 0.6,
    marginLeft: 31,
    marginTop: 67,
    marginBottom: 0
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 260, // Adjust width as per the image
    height: 260, // Adjust height as per the image
    marginBottom: 20,
    marginTop: -40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 34,
    fontWeight: '500', // Made bold
    marginBottom: 16,
    color: 'black'
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: 'center', // Align text centered and justify
    width: 350,
    marginBottom: 5
  },
  retryButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 1,
    width: 155,
    marginTop: 28,
    marginLeft: 20
  },
  retryButtonText: {
    color: 'black',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5
  }
});

export default OfflineFallback;


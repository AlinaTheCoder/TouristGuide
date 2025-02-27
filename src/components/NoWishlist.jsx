import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";


const NoWishlist = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Wishlists</Text>
      <View style={styles.content}>
        <Image
          source={require("../images/box.png")} // Ensure the image exists in assets folder
          style={styles.image}
        />
        <Text style={styles.title}>You don’t have any Wishlists yet</Text>
        <Text style={styles.subtitle}>Save your favorite experiences with TouristGuide and access them anytime.</Text>
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
    width: 200,
    height: 200,
    marginBottom: 60,
    marginTop: -75,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 21,
    fontWeight: '500', // Made bold
    marginBottom: 15,
    color: 'black'
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: 'center', // Align text centered and justify
    width: 340
  },
});


export default NoWishlist;
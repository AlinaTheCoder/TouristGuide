import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';

const NoTrips= () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Trips</Text>
      <View style={styles.content}>
        <Image
          source={require("../images/trips.png")} // Ensure the image exists in assets folder
          style={styles.image}
        />
        <Text style={styles.title}>No trips booked ... yet!</Text>
        <Text style={styles.subtitle}>Time to dust off your bags and start planning you next adventure</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Explore')}>
          <Text style={styles.buttonText}>Start Searching</Text>
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
    width: 200, // Adjust width as per the image
    height: 200, // Adjust height as per the image
    marginBottom: 40,
    marginTop: -68,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 21,
    fontWeight: '500', // Made bold
    marginBottom: 9,
    color: 'black'
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: 'center', // Align text centered and justify
    width: 300
  },
  button: {
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
  buttonText: {
    color: 'black',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5
  }
});


export default NoTrips;
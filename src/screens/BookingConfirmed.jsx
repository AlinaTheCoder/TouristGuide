import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const BookingConfirmed = () => {
  const navigation = useNavigation();

  const handleContinueBooking = () => {
    navigation.navigate('UserTabs', { screen: 'Explore' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../images/booked.png")} // Ensure the image exists in assets folder
          style={styles.image}
        />
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>Thank you for your order. You will receive email confirmation shortly.</Text>
        <TouchableOpacity style={styles.button} onPress={handleContinueBooking}>
            <Text style={styles.buttonText}>Continue Booking</Text>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 220, // Adjust width as per the image
    height: 220, // Adjust height as per the image
    marginBottom: 40,
    marginTop: -40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: '500', // Made bold
    marginBottom: 18,
    color: 'black'
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: 'center', // Align text centered and justify
    width: 320,
    marginBottom: 10
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

export default BookingConfirmed;
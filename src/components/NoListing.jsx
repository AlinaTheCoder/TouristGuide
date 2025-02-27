import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';

const NoListing = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Plus Icon in the top-right corner with light gray round container */}
      <TouchableOpacity style={styles.plusIconContainer}
        onPress={() => navigation.navigate('ActivityInformationScreen')}
      >
        <View style={styles.plusIconBackground}>
          <Image
            source={require('../icons/Plus.png')} // Replace with your local plus icon image path
            style={styles.plusIcon}
          />
        </View>
      </TouchableOpacity>
      <Text style={styles.headerText}>Your Listings</Text>
      <View style={styles.content}>
        {/* Placeholder Image */}
        <Image
          source={require('../images/Activity.png')}
          style={styles.image}
        />

        {/* Subtext */}
        <Text style={styles.subText}>You don’t have any Listings yet</Text>
        <Text style={styles.descriptionText}>Create a listing with TouristGuide and start getting booked.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ActivityInformationScreen')}>
          <Text style={styles.buttonText}>Get Started</Text>
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
  plusIconContainer: {
    position: 'absolute',
    top: 25, // Adjust for vertical positioning
    right: 25, // Adjust for horizontal positioning
    zIndex: 1, // Ensure it stays above other elements
  },
  plusIconBackground: {
    backgroundColor: '#eaeaea', // Light gray color for round container
    borderRadius: 30, // Circular container
    padding: 15, // Padding around the icon
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    width: 20, // Reduced size of the icon
    height: 20, // Reduced size of the icon
  },
  headerText: {
    fontSize: 38, // Increased font size
    fontWeight: '600', // Increased font weight
    color: 'black',
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
    marginBottom: 20,
    marginTop: -68,
    resizeMode: 'contain',
  },
  subText: {
    fontSize: 21,
    fontWeight: '500', // Made bold
    marginBottom: 9,
    color: 'black'
  },
  descriptionText: {
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

export default NoListing;
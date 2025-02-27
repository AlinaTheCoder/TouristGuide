import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Make sure to install this package
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import apiInstance from '../config/apiConfig';

const UserProfile = () => {
  const navigation = useNavigation();
  const [uid, setUid] = useState('');
  const [fullName, setFullName] = useState('');
  const [loginWithGoogle, setLoginWithGoogle] = useState('');

  useEffect(() => {
    const fetchUid = async () => {
      try {
        const storedUid = await AsyncStorage.getItem('uid');
        if (storedUid) {
          setUid(storedUid);
          // Call the API to fetch user info
          const response = await apiInstance.get(`/users/GetUserById/${storedUid}`);
          setFullName(response.data.name || 'N/A');
          setLoginWithGoogle(response.data.loginWithGoogle || 'N/A');
        } else {
          Alert.alert('Error', 'No UID found. Please log in.');
        }
      } catch (error) {
        console.error('Error fetching UID:', error);
        Alert.alert('Error', 'Failed to retrieve UID.');
      }
    };
    fetchUid();
  }, []);
  // session destroy krna  in logout (removed from local async storage)
  // Logout function
  const handleLogout = async () => {
    try {
      if (loginWithGoogle == '1') {
        try {
          console.log(" if try Working");
          // Sign out from Google
          await GoogleSignin.signOut();

          // Sign out from Firebase
          await auth().signOut();
          Alert.alert('Success', 'You have been logged out with Google!');
          await AsyncStorage.removeItem('isGoogleUser');
          navigation.navigate('Login')
        } catch (error) {
          console.error('Logout Error:', error.message);
          Alert.alert('Error', error.message || 'Failed to log out. Please try again.');
          navigation.replace('Login');
        }
      }
      else {
        console.log("else Working");
        // Remove the stored uid from AsyncStorage
        await AsyncStorage.removeItem('uid');
        Alert.alert('Success', 'You have been logged out!');
        // Navigate the user to the login screen
        navigation.replace('Login'); // Adjust based on your navigation setup
      }


    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
      console.error('Logout Error:', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Upper Profile Section */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarCircle}>
            {/* Avatar Initial */}
            <Text style={styles.avatarText}>
              {fullName ? fullName.charAt(0) : ''} {/* Use the first letter of the name or 'A' as a default */}
            </Text>
          </View>
          <View>
            <Text style={styles.profileName}>
              {fullName || 'Loading...'} {/* Show "Loading..." until the name is fetched */}
            </Text>
          </View>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {/* Personal Information */}
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('PersonalInfo')}
        >
          <View style={styles.optionRow}>
            <Image
              source={require('../icons/user.png')} // Placeholder for your icon
              style={styles.optionIcon1}
            />
            <Text style={styles.optionText}>Personal Information</Text>
          </View>
          <Image
            source={require('../icons/RightArrow.png')} // Placeholder for your icon
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Hosting Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Host Mode</Text>
        {/* Switch to Host Mode */}
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('HostTabs')} // This line navigates to the Host menu (Tabs component)
        >
          <View style={styles.optionRow}>
            <Image
              source={require('../icons/switch.png')} // Placeholder for your icon
              style={styles.optionIcon2}
            />
            <Text style={styles.optionText}>Switch to Host Mode</Text>
          </View>
          <Image
            source={require('../icons/RightArrow.png')} // Placeholder for your icon
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Log out Section */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Ensures the ScrollView stretches
    backgroundColor: 'white',
    paddingHorizontal: 25,
    paddingBottom: 40, // Adds space below the content for visibility
  },
  header: {
    paddingTop: 67,
    paddingBottom: 15,
    marginLeft: 6,
  },
  headerTitle: {
    fontSize: 38,
    fontWeight: '600',
    color: 'black',
    letterSpacing: 0.6,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 25,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'black',
    justifyContent: 'center', // Vertical centering
    alignItems: 'center', // Horizontal centering
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold', // Make text bold
    lineHeight: 60, // Match the height of the circle to perfectly center vertically
    textAlign: 'center', // Center text horizontally
    paddingLeft: 5
  },
  profileName: {
    fontSize: 22,
    fontWeight: '500',
    color: 'black',
  },
  section: {
    marginTop: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: '600',
    color: 'black',
    letterSpacing: 0.5,
    marginBottom: 15,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon1: {
    width: 28,
    height: 28,
    marginRight: 20,
    tintColor: '#555',
  },
  optionIcon2: {
    width: 31,
    height: 31,
    marginRight: 18,
    tintColor: '#555',
  },
  optionText: {
    fontSize: 18,
    color: 'black',
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  logoutButton: {
    paddingTop: 13,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  logoutText: {
    color: '#000',
    fontSize: 18,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});

export default UserProfile;
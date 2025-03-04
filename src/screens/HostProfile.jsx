// HostProfile.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import apiInstance from '../config/apiConfig';

const HostProfile = () => {
  const navigation = useNavigation();
  const [uid, setUid] = useState('');
  const [fullName, setFullName] = useState('');
  const [loginWithGoogle, setLoginWithGoogle] = useState('');

  // UseFocusEffect to re-run fetch logic whenever this screen is focused
  useFocusEffect(
    React.useCallback(() => {
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

          // Network vs. server error
          if (!error.response) {
            Alert.alert(
              'Network Error',
              'Unable to reach the server. Please check your internet connection and try again.'
            );
          } else {
            Alert.alert(
              'Error',
              error.response.data?.error ||
                error.response.data?.message ||
                error.message ||
                'Failed to retrieve UID.'
            );
          }
        }
      };
      fetchUid();
    }, [])
  );

  // Logout function
  const handleLogout = async () => {
    try {
      if (loginWithGoogle === '1') {
        // Google user
        try {
          await GoogleSignin.signOut();
          await auth().signOut();

          Alert.alert('Success', 'You have been logged out with Google');
          await AsyncStorage.removeItem('isGoogleUser');
          navigation.navigate('Login');
        } catch (error) {
          console.error('Logout Error:', error.message);

          if (!error.response) {
            Alert.alert(
              'Network Error',
              'Unable to reach the server. Please check your internet connection.'
            );
          } else {
            Alert.alert(
              'Error',
              error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                'Failed to log out. Please try again.'
            );
          }
          navigation.replace('Login');
        }
      } else {
        // Regular user
        await AsyncStorage.removeItem('uid');
        Alert.alert('Success', 'You have been logged out!');
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Logout Error:', error.message);

      if (!error.response) {
        Alert.alert(
          'Network Error',
          'Unable to reach the server. Please check your internet connection.'
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            'Failed to log out. Please try again.'
        );
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Host Profile</Text>
      </View>

      {/* Upper Profile Section */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarCircle}>
            {/* Avatar Initial */}
            <Text style={styles.avatarText}>
              {fullName ? fullName.charAt(0) : ''}
            </Text>
          </View>
          <View>
            <Text style={styles.profileName}>
              {fullName || 'Loading...'}
            </Text>
          </View>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('HostPersonalInfo')}
        >
          <View style={styles.optionRow}>
            <Image
              source={require('../icons/user.png')}
              style={styles.optionIcon1}
            />
            <Text style={styles.optionText}>Personal Information</Text>
          </View>
          <Image
            source={require('../icons/RightArrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Switch to User Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Mode</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('UserTabs')}
        >
          <View style={styles.optionRow}>
            <Image
              source={require('../icons/switch.png')}
              style={styles.optionIcon2}
            />
            <Text style={styles.optionText}>Switch to User Mode</Text>
          </View>
          <Image
            source={require('../icons/RightArrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Earnings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Earnings</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('Earnings')}
        >
          <View style={styles.optionRow}>
            <Image
              source={require('../icons/coin.png')}
              style={styles.optionIcon2}
            />
            <Text style={styles.optionText}>View your Earnings</Text>
          </View>
          <Image
            source={require('../icons/RightArrow.png')}
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

export default HostProfile;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    paddingHorizontal: 25,
    paddingBottom: 100,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 60,
    textAlign: 'center',
    paddingLeft: 5,
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
  footer: {
    marginTop: 20,
  },
  logoutButton: {
    marginTop: -10,
    backgroundColor: 'transparent',
  },
  logoutText: {
    color: '#000',
    fontSize: 18,
    textDecorationLine: 'underline',
    fontWeight: '500',
    marginBottom: 10,
  },
});

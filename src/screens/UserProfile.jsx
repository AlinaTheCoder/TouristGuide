// UserProfile.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import apiInstance from '../config/apiConfig';
import { launchImageLibrary } from 'react-native-image-picker';


const UserProfile = () => {
  const navigation = useNavigation();
  const [uid, setUid] = useState('');
  const [fullName, setFullName] = useState('');
  const [loginWithGoogle, setLoginWithGoogle] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
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
            setProfileImage(response.data.profileImage || null);
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


  // In UserProfile.jsx, update the handleImagePick function
  const handleImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      });


      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage);
        return;
      }


      const selectedImage = result.assets[0];


      // Validate image size (max 2MB)
      if (selectedImage.fileSize > 2 * 1024 * 1024) {
        Alert.alert(
          'Image Too Large',
          'Please select an image smaller than 2MB.'
        );
        return;
      }


      // Create FormData for the image upload
      const formData = new FormData();
      formData.append('image', {
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.fileName || 'profile.jpg',
      });
      formData.append('uid', uid);


      // Show loading indicator
      setIsUploading(true);


      // Upload the image
      const response = await apiInstance.post('/users/updateProfileImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });


      setIsUploading(false);


      if (response.data.imageUrl) {
        setProfileImage(response.data.imageUrl);
        Alert.alert('Success', 'Profile image updated successfully!');
      }
    } catch (error) {
      setIsUploading(false);
      console.error('Image upload error:', error);


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
          'Failed to update profile image. Please try again.'
        );
      }
    }
  };
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
        <Text style={styles.headerTitle}>Profile</Text>
      </View>








      {/* Upper Profile Section */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          {profileImage ? (
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: profileImage }}
                style={styles.avatarCircle}
                resizeMode="cover"
              />
              {isUploading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#000" />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.editIconContainer}
                  onPress={handleImagePick}
                >
                  <Image
                    source={require('../icons/edit.png')}
                    style={styles.editIcon}
                  />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {fullName ? fullName.charAt(0) : ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editIconContainer}
                onPress={handleImagePick}
              >
                <Image
                  source={require('../icons/edit.png')}
                  style={styles.editIcon}
                />
              </TouchableOpacity>
            </View>
          )}
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
          onPress={() => navigation.navigate('PersonalInfo')}
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
          onPress={() => navigation.navigate('HostTabs')}
        >
          <View style={styles.optionRow}>
            <Image
              source={require('../icons/switch.png')}
              style={styles.optionIcon2}
            />
            <Text style={styles.optionText}>Switch to Host Mode</Text>
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








export default UserProfile;








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
    overflow: 'hidden', // This ensures the image respects the rounded corners
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 60,
    textAlign: 'center',
    paddingLeft: 1,
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
  // Add these to styles in UserProfile.jsx
  avatarContainer: {
    position: 'relative',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  editIcon: {
    width: 16,
    height: 16,
    tintColor: '#555',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});



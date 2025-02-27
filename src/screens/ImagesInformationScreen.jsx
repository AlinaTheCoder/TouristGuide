import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Header from '../components/Header';
import FooterTwo from '../components/FooterTwo';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from '../config/apiConfig';




const ImagesInformationScreen = () => {
  const navigation = useNavigation();
  const [activityImages, setActivityImages] = useState([]); // State for activity images
  const [profileImage, setProfileImage] = useState(null); // State for profile image
  const [isActivityUploading, setIsActivityUploading] = useState(false); // Loader for activity images
  const [isProfileUploading, setIsProfileUploading] = useState(false); // Loader for profile image
  const [errorMessage, setErrorMessage] = useState('');
  const [profileErrorMessage, setProfileErrorMessage] = useState('');




  // Load saved data on mount
  useEffect(() => {
    const loadImagesInfo = async () => {
      try {
        const savedImagesInfo = await AsyncStorage.getItem('imagesInfo');
        if (savedImagesInfo) {
          const { profileImage, activityImages } = JSON.parse(savedImagesInfo);
          setProfileImage(profileImage || null);
          setActivityImages(activityImages || []);
        }
      } catch (error) {
        console.error('Error loading images info:', error);
      }
    };
    loadImagesInfo();
  }, []);




  const uploadToBackend = async (file, fileType) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri.startsWith('file://') ? file.uri : `file://${file.uri}`,
      type: file.type || 'image/jpeg',
      name: file.name || `file_${Date.now()}.jpg`,
    });
    formData.append('fileType', fileType);




    try {
      const response = await apiInstance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Upload Successful:', response.data.url);
      return response.data.url;
    } catch (error) {
      console.error('Upload Failed:', error.response?.data || error.message);
      Alert.alert('Upload Failed', 'Failed to upload the file to the server.');
      throw error;
    }
  };




  const handleImagePicker = async (isProfile = false) => {
    console.log('Opening image picker for:', isProfile ? 'profileImage' : 'activityImage');
    const remainingSlots = 5 - activityImages.length; // Calculate remaining slots for activity images


    if (!isProfile && remainingSlots <= 0) {
      Alert.alert('Maximum Limit Reached', 'You can only upload up to 5 activity images.');
      return;
    }


    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: isProfile ? 1 : remainingSlots, // Restrict selection to remaining slots
      },
      async (response) => {
        if (response.didCancel || response.errorCode) {
          console.log('Image picker cancelled or errored.');
          return;
        }


        const oversizedFiles = response.assets.filter(asset => asset.fileSize > 4 * 1024 * 1024); // Filter files over 4MB
        if (oversizedFiles.length > 0) {
          Alert.alert('File Size Limit', 'Please select images smaller than 4MB.');
          return;
        }




        const newImages = response.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName,
          type: asset.type,
        }));
        const fileType = isProfile ? 'profileImage' : 'activityImage';


        if (isProfile) setIsProfileUploading(true);
        else setIsActivityUploading(true);


        try {
          const uploadedUrls = await Promise.all(
            newImages.map(async (file) => {
              console.log(`Uploading ${fileType}...`, file);
              const uploadedUrl = await uploadToBackend(file, fileType);
              console.log(`${fileType} uploaded to:`, uploadedUrl);
              return { uri: uploadedUrl };
            })
          );


          if (isProfile) {
            setProfileImage(uploadedUrls[0]);
            setProfileErrorMessage('');
          } else {
            setActivityImages((prev) => [...prev, ...uploadedUrls]);
            setErrorMessage('');
          }
        } catch (error) {
          console.error(`${fileType} upload error:`, error);
          Alert.alert('Upload Error', 'Failed to upload the image. Please try again.');
        } finally {
          if (isProfile) setIsProfileUploading(false);
          else setIsActivityUploading(false);
        }
      }
    );
  };






  const handleRemoveImage = (index) => {
    const updatedImages = activityImages.filter((_, i) => i !== index);
    setActivityImages(updatedImages);
  };




  const handleRemoveProfileImage = () => {
    setProfileImage(null);
    setProfileErrorMessage('Please upload a profile image.');
  };




  const handleNext = async () => {
    const imagesInfo = { profileImage, activityImages: activityImages };
    if (activityImages.length < 3) {
      setErrorMessage('Please upload at least 3 activity images.');
      return;
    }
    if (!profileImage) {
      setProfileErrorMessage('Please upload a profile image.');
      return;
    }




    try {
      await AsyncStorage.setItem('imagesInfo', JSON.stringify(imagesInfo));
      console.log('Images Info Saved:', imagesInfo);
      navigation.navigate('HostInformationScreen');
    } catch (error) {
      Alert.alert('Error', 'Failed to save images information.');
    }
  };




  const handleBack = () => {
    navigation.navigate('PriceInformationScreen');
  };




  const progress = 83.25 / 16.65;




  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <Header imageSource={require('../icons/six.png')} title="Images Info" />
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Upload activity photos. Max: 4MB</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={() => handleImagePicker(false)}>
                <Text style={styles.buttonText}>Upload Activity Photos</Text>
              </TouchableOpacity>
              {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}




              {isActivityUploading ? (
                <ActivityIndicator size="large" color="#FF5A5F" style={styles.loader} />
              ) : (
                <View style={styles.imageContainer}>
                  {activityImages.map((image, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri: image.uri }} style={styles.image} />
                      <TouchableOpacity
                        style={styles.deleteIcon}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Image source={require('../icons/bin.png')} style={styles.icon} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}




              <Text style={[styles.label, styles.marginTop]}>Upload your profile photo. Max: 4MB</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={() => handleImagePicker(true)}>
                <Text style={styles.buttonText}>Upload Profile Photo</Text>
              </TouchableOpacity>
              {profileErrorMessage ? <Text style={styles.error}>{profileErrorMessage}</Text> : null}




              {isProfileUploading ? (
                <ActivityIndicator size="large" color="#FF5A5F" style={styles.loader} />
              ) : (
                profileImage && (
                  <View style={[styles.imageWrapper, styles.marginTop]}>
                    <Image source={{ uri: profileImage.uri }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.profileDeleteIcon}
                      onPress={handleRemoveProfileImage}
                    >
                      <Image source={require('../icons/bin.png')} style={styles.icon} />
                    </TouchableOpacity>
                  </View>
                )
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>




        {!Keyboard.isVisible() && (
          <FooterTwo
            progress={progress}
            onNext={handleNext}
            onBack={handleBack}
            nextButtonText="Next"
            backButtonText="Back"
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};




const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#ffffff' },
  inputContainer: { marginBottom: 10 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  uploadButton: { height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRadius: 5, borderWidth: 1, borderColor: '#ccc', marginTop: 8 },
  buttonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  loader: { marginTop: 20 },
  marginTop: { marginTop: 20 },
  imageContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 18 },
  imageWrapper: { position: 'relative', marginRight: 10, marginBottom: 10 },
  image: { width: 110, height: 110, borderRadius: 5 },
  deleteIcon: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 15, padding: 5 },
  profileDeleteIcon: { position: 'absolute', top: 5, right: 255, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 20, padding: 5 },
  icon: { width: 15, height: 15 },
  error: { color: 'red', marginTop: 10, fontSize: 14 },
});




export default ImagesInformationScreen;




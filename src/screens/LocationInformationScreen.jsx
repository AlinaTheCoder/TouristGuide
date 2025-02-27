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
  Alert,
} from 'react-native';
import Header from '../components/Header';
import FooterTwo from '../components/FooterTwo';
import InputFieldHostForm from '../components/InputFeildHostForm';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage to persist data
import CategorySelector from '../components/CategorySelector';
import DescriptionInputFieldOptional from '../components/DescriptionInputFieldOptional';


const LocationInformationScreen = () => {
  const navigation = useNavigation();


  // State variables to store user input for the location information
  const [city, setCity] = useState(''); // Stores the selected activity category
  const [address, setAddress] = useState(''); // Stores the address of the activity
  const [locationDescription, setLocationDescription] = useState(''); // Stores the optional location description
  const [descriptionWordCount, setDescriptionWordCount] = useState(0); // Tracks word count for description
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false); // Tracks keyboard visibility state


  // Load saved location information from AsyncStorage when the component mounts
  useEffect(() => {
    const loadLocationInfo = async () => {
      try {
        const savedLocationInfo = await AsyncStorage.getItem('locationInfo');
        if (savedLocationInfo) {
          const { city, address, locationDescription } = JSON.parse(savedLocationInfo);
          setCity(city || ''); // Match the property name from handleNext
          setAddress(address || ''); // Match the property name from handleNext
          setLocationDescription(locationDescription || ''); // Match the property name from handleNext
          setDescriptionWordCount(
            locationDescription 
              ? locationDescription.trim().split(/\s+/).filter(Boolean).length 
              : 0
          );
        }
      } catch (error) {
        console.error('Error loading location info:', error);
      }
    };
  
    // Add focus listener to reload data when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadLocationInfo();
    });
  
    // Initial load
    loadLocationInfo();
  
    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, [navigation]); // Add navigation as a dependency


  // Handle keyboard visibility to adjust the layout
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));


    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);


  // Handle the description text change and update the word count
  const handleDescriptionChange = (text) => {
    setLocationDescription(text);
    const count = text.trim().split(/\s+/).filter(Boolean).length; // Calculate word count
    setDescriptionWordCount(count); // Update the word count state
  };


  // Validate the location input to ensure it follows the required format
  const isValidLocation = (text) => {
    // Regex to match the format: Street (required), Optional Town/Village
    const regex = /^[a-zA-Z0-9\s,.'-]+(?:,\s*[a-zA-Z\s]+)?$/;
    return regex.test(text); // Return true if the address matches the regex
  };


  // Handle the 'Next' button click, perform validation, and navigate to the next screen
  const handleNext = async () => {
    // Validate if the category is selected
    if (!city.trim()) {
      Alert.alert('Incomplete Fields', 'Please select an activity category before proceeding.');
      return;
    }


    // Validate the address format
    if (!address.trim() || !isValidLocation(address.trim())) {
      Alert.alert(
        'Invalid Location',
        'Please enter a valid location. The format should be: Street (required), Optional Town/Village.'
      );
      return;
    }


    // Ensure the description does not exceed 150 words
    if (descriptionWordCount > 150) {
      Alert.alert('Description Too Long', 'Your description cannot exceed 150 words.');
      return;
    }


    // Save the location information to AsyncStorage
    const locationInfo = { city: city, address: address, locationDescription: locationDescription };


    try {
      await AsyncStorage.setItem('locationInfo', JSON.stringify(locationInfo)); // Save the location data
      navigation.navigate('ScheduleInformationScreen'); // Navigate to the next screen
    } catch (error) {
      Alert.alert('Error', 'Failed to save location information.'); // Show error if saving fails
    }
  };


  // Handle the back navigation
  const handleBack = () => {
    navigation.navigate('ActivityInformationScreen'); // Navigate back to the previous screen
  };


  // Set the static progress bar value to 1/6 (one-sixth filled)
  const progress = 16.65 / 16.65;


  // List of city categories for selection
  const cityCategories = [
    { label: 'Abbottabad', value: 'Abbottabad' },
    { label: 'Ahmadpur East', value: 'Ahmadpur East' },
    { label: 'Alipur', value: 'Alipur' },
    { label: 'Attock', value: 'Attock' },
    { label: 'Bahawalnagar', value: 'Bahawalnagar' },
    { label: 'Bahawalpur', value: 'Bahawalpur' },
    { label: 'Bannu', value: 'Bannu' },
    { label: 'Barikot', value: 'Barikot' },
    { label: 'Bhalwal', value: 'Bhalwal' },
    { label: 'Chakwal', value: 'Chakwal' },
    { label: 'Chaman', value: 'Chaman' },
    { label: 'Chiniot', value: 'Chiniot' },
    { label: 'Dera Ghazi Khan', value: 'Dera Ghazi Khan' },
    { label: 'Dera Ismail Khan', value: 'Dera Ismail Khan' },
    { label: 'Faisalabad', value: 'Faisalabad' },
    { label: 'Gilgit', value: 'Gilgit' },
    { label: 'Gojra', value: 'Gojra' },
    { label: 'Gujranwala', value: 'Gujranwala' },
    { label: 'Hafizabad', value: 'Hafizabad' },
    { label: 'Haripur', value: 'Haripur' },
    { label: 'Islamabad', value: 'Islamabad' },
    { label: 'Jacobabad', value: 'Jacobabad' },
    { label: 'Jhelum', value: 'Jhelum' },
    { label: 'Karachi', value: 'Karachi' },
    { label: 'Kasur', value: 'Kasur' },
    { label: 'Khairpur', value: 'Khairpur' },
    { label: 'Khuzdar', value: 'Khuzdar' },
    { label: 'Kotli', value: 'Kotli' },
    { label: 'Lahore', value: 'Lahore' },
    { label: 'Larkana', value: 'Larkana' },
    { label: 'Mardan', value: 'Mardan' },
    { label: 'Mirpur', value: 'Mirpur' },
    { label: 'Multan', value: 'Multan' },
    { label: 'Muzaffarabad', value: 'Muzaffarabad' },
    { label: 'Nawabshah', value: 'Nawabshah' },
    { label: 'Okara', value: 'Okara' },
    { label: 'Peshawar', value: 'Peshawar' },
    { label: 'Quetta', value: 'Quetta' },
    { label: 'Rawalpindi', value: 'Rawalpindi' },
    { label: 'Sahiwal', value: 'Sahiwal' },
    { label: 'Sialkot', value: 'Sialkot' },
    { label: 'Sukkur', value: 'Sukkur' },
    { label: 'Swat', value: 'Swat' },
    { label: 'Turbat', value: 'Turbat' },
    { label: 'Wah Cantt', value: 'Wah Cantt' },
    { label: 'Zhob', value: 'Zhob' },
  ];


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Header imageSource={require('../icons/two.png')} title="Location Info" />


            <View style={styles.inputContainer}>
              <Text style={styles.label}>In which city does the activity take place?</Text>
              <CategorySelector
                selectedCategory={city}
                onSelectCategory={setCity}
                categories={cityCategories}
              />
            </View>


            <View style={styles.inputContainer}>
              <Text style={styles.label}>What's the exact address of the activity?</Text>
              <InputFieldHostForm
                placeholder="Street, Town/Village (optional)"
                value={address}
                onChangeText={setAddress}
              />
            </View>


            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location Description (Optional)</Text>
              <DescriptionInputFieldOptional
                placeholder="Tell guests the location's unique details, like atmosphere or historical significance."
                value={locationDescription}
                onChangeText={handleDescriptionChange}
                wordCount={descriptionWordCount}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>


        {!isKeyboardVisible && (
          <FooterTwo
            progress={progress} // Set the static progress bar to 1/6 (one-sixth filled)
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


// Styles for the screen components
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
  },
});


export default LocationInformationScreen;




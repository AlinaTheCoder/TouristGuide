import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  Alert,
} from 'react-native';
import Header from '../components/Header';
import InputFieldHostForm from '../components/InputFeildHostForm';
import CategorySelector from '../components/CategorySelector';
import DescriptionInputField from '../components/DescriptionInputField';
import Footer from '../components/Footer';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from '../config/apiConfig';


const ActivityInformationScreen = () => {
  const navigation = useNavigation();
  const [activityTitle, setActivityTitle] = useState('');
  const [activityCategory, setActivityCategory] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [hostName, setHostName] = useState('');
  const [titleError, setTitleError] = useState('');


  useEffect(() => {
    const loadActivityInfo = async () => {
      try {
        const savedActivityInfo = await AsyncStorage.getItem('activityInfo');
        if (savedActivityInfo) {
          const parsedInfo = JSON.parse(savedActivityInfo);
          setActivityTitle(parsedInfo.activityTitle || '');
          setActivityCategory(parsedInfo.activityCategory || '');
          setActivityDescription(parsedInfo.activityDescription || '');
          setWordCount(
            parsedInfo.activityDescription
              ? parsedInfo.activityDescription.trim().split(/\s+/).length
              : 0
          );
        }
      } catch (error) {
        console.error('Error loading activity info:', error);
        Alert.alert('Error', 'Failed to load activity information.');
      }
    };


    const fetchHostName = async () => {
      try {
        const storedUid = await AsyncStorage.getItem('uid');
        if (storedUid) {
          const response = await apiInstance.get(`/users/GetUserById/${storedUid}`);
          if (response.data && response.data.name) {
            setHostName(response.data.name);
          } else {
            Alert.alert('Error', 'Host name not found.');
          }
        } else {
          Alert.alert('Error', 'No UID found. Please log in.');
        }
      } catch (error) {
        console.error('Error fetching host name:', error);
        Alert.alert('Error', 'Failed to retrieve host name.');
      }
    };


    fetchHostName();
    loadActivityInfo();


    const showSubscription = Keyboard.addListener('keyboardDidShow', () =>
      setIsKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () =>
      setIsKeyboardVisible(false)
    );


    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);


  const handleDescriptionChange = (text) => {
    setActivityDescription(text);
    const count = text.trim().split(/\s+/).length;
    setWordCount(count);
  };


  const handleTitleChange = (text) => {
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount <= 4) {
      setActivityTitle(text);
      setTitleError('');
    } else {
      setTitleError('Activity title cannot exceed 4 words.');
    }
  };


  const handleNext = async () => {
    const activityInfo = { activityTitle, activityCategory, activityDescription, hostName };
    const titleWordCount = activityTitle.trim().split(/\s+/).length;


    if (!activityTitle.trim()) {
      setTitleError('Please provide a title for your activity.');
      return;
    }


    if (titleWordCount > 4) {
      Alert.alert('Invalid Title', 'Activity title cannot exceed 4 words.');
      return;
    }


    if (wordCount < 50) {
      Alert.alert('Description Too Short', 'Your description must contain at least 50 words.');
      return;
    }


    if (wordCount > 150) {
      Alert.alert('Description Too Long', 'Your description cannot exceed 150 words.');
      return;
    }


    try {
      await AsyncStorage.setItem('activityInfo', JSON.stringify(activityInfo));
      navigation.navigate('LocationInformationScreen');
    } catch (error) {
      Alert.alert('Error', 'Failed to save activity information.');
    }
  };
  const categories = [
    { label: 'Ziplining', value: 'Ziplining' },
    { label: 'Beaches', value: 'Beaches' },
    { label: 'Surfing', value: 'Surfing' },
    { label: 'Sking', value: 'Sking' },
    { label: 'Cooking', value: 'Cooking' },
    { label: 'Playing', value: 'Playing' },
    { label: 'Amusement Parks', value: 'Amusement Parks' },
    { label: 'Autumn Photography', value: 'Autumn Photography' },
    { label: 'Boating', value: 'Boating' },
    { label: 'Camping', value: 'Camping' },
    { label: 'Caving', value: 'Caving' },
    { label: 'Cycling', value: 'Cycling' },
    { label: 'Cultural Festivals', value: 'Cultural Festivals' },
    { label: 'Desert Safari', value: 'Desert Safari' },
    { label: 'Fishing', value: 'Fishing' },
    { label: 'Food Streets', value: 'Food Streets' },
    { label: 'Farm Tours', value: 'Farm Tours' },
    { label: 'Glacier Viewing', value: 'Glacier Viewing' },
    { label: 'Handicraft', value: 'Handicraft' },
    { label: 'Heritage Tours', value: 'Heritage Tours' },
    { label: 'Hiking', value: 'Hiking' },
    { label: 'Horse Riding', value: 'Horse Riding' },
    { label: 'Jet Skiing', value: 'Jet Skiing' },
    { label: 'Local Food Tasting', value: 'Local Food Tasting' },
    { label: 'Museum Visits', value: 'Museum Visits' },
    { label: 'Nature Walks', value: 'Nature Walks' },
    { label: 'Paragliding', value: 'Paragliding' },
    { label: 'Photography Expeditions', value: 'Photography Expeditions' },
    { label: 'Rock Climbing', value: 'Rock Climbing' },
    { label: 'Scuba Diving', value: 'Scuba Diving' },
    { label: 'Shrine Visits', value: 'Shrine Visits' },
    { label: 'Shopping Malls', value: 'Shopping Malls' },
    { label: 'Markets', value: 'Markets' },
    { label: 'Snow Sports', value: 'Snow Sports' },
    { label: 'Stargazing', value: 'Stargazing' },
    { label: 'Swimming', value: 'Swimming' },
    { label: 'Village Tourism', value: 'Village Tourism' },
    { label: 'Water Rafting', value: 'Water Rafting' },
    { label: 'Wildlife Safaris', value: 'Wildlife Safaris' },
  ];


  const progress = 0;


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Header imageSource={require('../icons/one.png')} title="Activity Info" />


            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name your Activity</Text>
              <InputFieldHostForm
                placeholder="Explore Iceland's secret hot springs"
                value={activityTitle}
                onChangeText={handleTitleChange}
              />
              {titleError ? <Text style={styles.error}>{titleError}</Text> : null}
            </View>


            <View style={styles.inputContainer}>
              <Text style={styles.label}>What will your experience focus on?</Text>
              <CategorySelector
                selectedCategory={activityCategory}
                onSelectCategory={setActivityCategory}
                categories={categories}
              />
            </View>


            <View style={styles.inputContainer}>
              <Text style={styles.label}>What will you and your guests do?</Text>
              <DescriptionInputField
                placeholder="Tell guests the story of what they'll do."
                value={activityDescription}
                onChangeText={handleDescriptionChange}
                wordCount={wordCount}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>


        {!isKeyboardVisible && (
          <Footer progress={progress} progressWidth="0%" onNext={handleNext} />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


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
  error: {
    color: 'red',
    fontSize: 12,
  },
});


export default ActivityInformationScreen;




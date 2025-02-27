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
import InputFieldHostFormAge from '../components/InputFieldHostFormAge';
import CategorySelector from '../components/CategorySelector';
import FooterTwo from '../components/FooterTwo';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const ParticipantsInformationScreen = () => {
  const navigation = useNavigation();
 
  // State variables to hold the user input for participants information
  const [peoplePerDay, setPeoplePerDay] = useState('');
  const [peoplePerTime, setPeoplePerTime] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [language, setLanguage] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);


  // Load saved data from AsyncStorage when the screen loads
  useEffect(() => {
    const loadParticipantsInfo = async () => {
      try {
        const savedParticipantsInfo = await AsyncStorage.getItem('participantsInfo');
        if (savedParticipantsInfo) {
          const { maxGuestsPerDay, maxGuestsPerTime, ageGroup, language } = JSON.parse(savedParticipantsInfo);
          setPeoplePerDay(maxGuestsPerDay || '');
          setPeoplePerTime(maxGuestsPerTime || '');
          setAgeGroup(ageGroup || '');
          setLanguage(language || '');
        }
      } catch (error) {
        console.error('Error loading participants info:', error);
      }
    };
    loadParticipantsInfo();
  }, []);


  // Handle keyboard visibility for better UX
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));


    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);


  // Handle validation and navigation to the next screen
  const handleNext = async () => {
    const participantsInfo = {
      maxGuestsPerDay: peoplePerDay,
      maxGuestsPerTime: peoplePerTime,
      ageGroup,
      language: language,
    };


    if (!peoplePerDay.trim()) {
      Alert.alert('Error', 'Please specify the maximum number of guests per day.');
      return;
    }


    if (!peoplePerTime.trim()) {
      Alert.alert('Error', 'Please specify the maximum number of guests at the same time.');
      return;
    }


    if (!ageGroup) {
      Alert.alert('Error', 'Please select an age group.');
      return;
    }


    if (!language) {
      Alert.alert('Error', 'Please select a language.');
      return;
    }


    try {
      await AsyncStorage.setItem('participantsInfo', JSON.stringify(participantsInfo));
      navigation.navigate('PriceInformationScreen');
    } catch (error) {
      Alert.alert('Error', 'Failed to save participants information.');
    }
  };


  const handleBack = () => {
    navigation.navigate('ScheduleInformationScreen');
  };


  const progress = 49.95 / 16.65;


  const ageGroups = [
    { label: 'Children (1-12)', value: 'Children' },
    { label: 'Teenagers (13-19)', value: 'Teenagers' },
    { label: 'Adults (20+)', value: 'Adults' },
    { label: 'Children and Teenagers (1-19)', value: 'Children and Teenagers' },
    { label: 'Teenagers and Adults (13-20+)', value: 'Teenagers and Adults' },
    { label: 'All Ages (1+)', value: 'All Ages' },
  ];


  const languageOptions = [
    { label: 'English', value: 'English' },
    { label: 'Urdu', value: 'Urdu' },
    { label: 'Punjabi', value: 'Punjabi' },
    { label: 'Sindhi', value: 'Sindhi' },
    { label: 'Pashto', value: 'Pashto' },
  ];


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Header imageSource={require('../icons/four.png')} title="Participants Info" />


            <View style={styles.inputContainer}>
              <Text style={styles.label}>How many people can join in a day?</Text>
              <InputFieldHostFormAge
                placeholder="Maximum no. of guests in a day"
                value={peoplePerDay}
                onChangeText={setPeoplePerDay}
              />
            </View>


            <View style={styles.inputContainer}>
              <Text style={styles.label}>How many people can join at the same time in a day?</Text>
              <InputFieldHostFormAge
                placeholder="Maximum no. of guests at the same time"
                value={peoplePerTime}
                onChangeText={setPeoplePerTime}
              />
            </View>


            <View style={styles.inputContainer}>
              <Text style={styles.label}>What age group is this for?</Text>
              <CategorySelector
                selectedCategory={ageGroup}
                onSelectCategory={setAgeGroup}
                categories={ageGroups}
              />
            </View>


            <View style={styles.inputContainer}>
              <Text style={styles.label}>Which language will be used?</Text>
              <CategorySelector
                selectedCategory={language}
                onSelectCategory={setLanguage}
                categories={languageOptions}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>


        {!isKeyboardVisible && (
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
});


export default ParticipantsInformationScreen;




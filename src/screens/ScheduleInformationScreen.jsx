import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  Alert,
} from 'react-native';
import Header from '../components/Header';
import FooterTwo from '../components/FooterTwo';
import DateRangePicker from '../components/DateRangePicker';
import TimePicker from '../components/TimePicker';
import CategorySelector from '../components/CategorySelector';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const ScheduleInformationScreen = () => {
  const navigation = useNavigation();


  // State variables to manage form data
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [duration, setDuration] = useState(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);


  // Duration options for the activity
  const durationOptions = [
    { label: '30 minutes', value: '30 minutes' },
    { label: '1 hour', value: '1 hour' },
    { label: '1.5 hours', value: '1.5 hours' },
    { label: '2 hours', value: '2 hours' },
    { label: '2.5 hours', value: '2.5 hours' },
    { label: '3 hours', value: '3 hours' },
    { label: '3.5 hours', value: '3.5 hours' },
    { label: '4 hours', value: '4 hours' },
    { label: '4.5 hours', value: '4.5 hours' },
    { label: '5 hours', value: '5 hours' },
    { label: '5.5 hours', value: '5.5 hours' },
    { label: '6 hours', value: '6 hours' },
    { label: '6.5 hours', value: '6.5 hours' },
    { label: '7 hours', value: '7 hours' },
    { label: '7.5 hours', value: '7.5 hours' },
    { label: '8 hours', value: '8 hours' },
    { label: '8.5 hours', value: '8.5 hours' },
    { label: '9 hours', value: '9 hours' },
    { label: '9.5 hours', value: '9.5 hours' },
    { label: '10 hours', value: '10 hours' },
    { label: '10.5 hours', value: '10.5 hours' },
    { label: '11 hours', value: '11 hours' },
    { label: '11.5 hours', value: '11.5 hours' },
    { label: '12 hours', value: '12 hours' },
    { label: '12.5 hours', value: '12.5 hours' },
    { label: '13 hours', value: '13 hours' },
    { label: '13.5 hours', value: '13.5 hours' },
    { label: '14 hours', value: '14 hours' },
    { label: '14.5 hours', value: '14.5 hours' },
    { label: '15 hours', value: '15 hours' },
    { label: '15.5 hours', value: '15.5 hours' },
    { label: '16 hours', value: '16 hours' },
    { label: '16.5 hours', value: '16.5 hours' },
    { label: '17 hours', value: '17 hours' },
    { label: '17.5 hours', value: '17.5 hours' },
    { label: '18 hours', value: '18 hours' },
    { label: '18.5 hours', value: '18.5 hours' },
    { label: '19 hours', value: '19 hours' },
    { label: '19.5 hours', value: '19.5 hours' },
    { label: '20 hours', value: '20 hours' },
    { label: '20.5 hours', value: '20.5 hours' },
    { label: '21 hours', value: '21 hours' },
    { label: '21.5 hours', value: '21.5 hours' },
    { label: '22 hours', value: '22 hours' },
    { label: '22.5 hours', value: '22.5 hours' },
    { label: '23 hours', value: '23 hours' },
    { label: '23.5 hours', value: '23.5 hours' },
    { label: '24 hours', value: '24 hours' },
  ];


  // Load saved schedule data from AsyncStorage on component mount
  useEffect(() => {
    const loadScheduleInfo = async () => {
      try {
        const savedScheduleInfo = await AsyncStorage.getItem('scheduleInfo');
        if (savedScheduleInfo) {
          const { startTime, endTime, dateRange, duration } = JSON.parse(savedScheduleInfo);
          setStartTime(startTime || null);
          setEndTime(endTime || null);
          setDateRange(dateRange || { startDate: null, endDate: null });
          setDuration(duration || null);
        }
      } catch (error) {
        console.error('Error loading schedule info:', error);
      }
    };
    loadScheduleInfo();
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


  // Handle the "Next" button click with validation and data saving
  const handleNext = async () => {
    // Validate that all required fields are filled
    if (!startTime || !endTime || !dateRange.startDate || !dateRange.endDate || !duration) {
      Alert.alert('Incomplete Fields', 'Please fill in all the required fields before proceeding.');
      return;
    }


    const scheduleInfo = { startTime, endTime, dateRange, duration };


    try {
      // Save the schedule info to AsyncStorage
      await AsyncStorage.setItem('scheduleInfo', JSON.stringify(scheduleInfo));
      console.log('Schedule Info Saved:', scheduleInfo);
      // Navigate to the next screen
      navigation.navigate('ParticipantsInformationScreen');
    } catch (error) {
      Alert.alert('Error', 'Failed to save schedule information.');
    }
  };


  // Handle the "Back" button click to navigate to the previous screen
  const handleBack = () => {
    navigation.navigate('LocationInformationScreen');
  };


  // Progress percentage for the schedule step (for UI purposes)
  const progress = 33.3 / 16.65;


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <Header imageSource={require('../icons/three.png')} title="Schedule Info" />


            {/* Time picker input for start and end times */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>When will it happen?</Text>
              <TimePicker
                startTime={startTime}
                endTime={endTime}
                onStartTimeChange={setStartTime}
                onEndTimeChange={setEndTime}
              />
            </View>


            {/* Date range picker input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>How long will it last?</Text>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </View>


            {/* Duration selector input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>What is the duration of the activity?</Text>
              <CategorySelector
                selectedCategory={duration}
                onSelectCategory={setDuration}
                categories={durationOptions}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>


        {/* Footer with navigation buttons */}
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
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
});


export default ScheduleInformationScreen;




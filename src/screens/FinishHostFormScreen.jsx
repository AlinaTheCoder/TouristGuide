// FinishHostFormScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import FooterTwo from '../components/FooterTwo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from '../config/apiConfig';
import { useNavigation } from '@react-navigation/native';

const FinishHostFormScreen = () => {
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false); // Loader state during API call

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const activityInfo = JSON.parse(await AsyncStorage.getItem('activityInfo'));
      const locationInfo = JSON.parse(await AsyncStorage.getItem('locationInfo'));
      const scheduleInfo = JSON.parse(await AsyncStorage.getItem('scheduleInfo'));
      const participantsInfo = JSON.parse(await AsyncStorage.getItem('participantsInfo'));
      const priceInfo = JSON.parse(await AsyncStorage.getItem('priceInfo'));
      const imagesInfo = JSON.parse(await AsyncStorage.getItem('imagesInfo'));
      const hostInfo = JSON.parse(await AsyncStorage.getItem('hostInfo'));

      if (
        !activityInfo ||
        !locationInfo ||
        !scheduleInfo ||
        !participantsInfo ||
        !priceInfo ||
        !imagesInfo ||
        !hostInfo
      ) {
        Alert.alert('Error', 'Some required information is missing. Please review the form.');
        setIsSubmitting(false);
        return;
      }

      // Make the API call
      const response = await apiInstance.post('/create', {
        activityInfo,
        locationInfo,
        scheduleInfo,
        participantsInfo,
        priceInfo,
        imagesInfo,
        hostInfo,
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Your activity has been listed successfully!');
        await AsyncStorage.multiRemove([
          'activityInfo',
          'locationInfo',
          'scheduleInfo',
          'participantsInfo',
          'priceInfo',
          'imagesInfo',
          'hostInfo',
        ]);
        navigation.navigate('HostTabs', { screen: 'Listings' });
      } else {
        throw new Error('Unexpected server response.');
      }
    } catch (error) {
      console.error('Error submitting activity:', error);

      // --- Distinguish network vs. server error
      if (!error.response) {
        Alert.alert(
          'Network Error',
          'Unable to reach the server. Please check your internet connection and try again.'
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            'Failed to submit the activity.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = 160 / 16.65;

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Image source={require('../icons/clock.png')} style={styles.clockImage} />
          <View style={styles.textContainer}>
            <Text style={styles.waitingText}>Awaiting Admin Approval</Text>
            <Text style={styles.waitingText1}>
              Thank you for submitting the form. Please allow up to 24 hours for admin approval. We
              will notify you once the approval is processed.
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>

      <FooterTwo
        progress={progress}
        onNext={handleFinish}
        onBack={handleBack}
        nextButtonText={
          isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : 'Finish'
        }
        backButtonText="Back"
        disableNext={isSubmitting} // Disable "Finish" button during API call
      />
    </SafeAreaView>
  );
};

export default FinishHostFormScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    flexDirection: 'column',
  },
  clockImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginTop: 50,
    marginBottom: 50,
  },
  textContainer: {
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  waitingText1: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
});

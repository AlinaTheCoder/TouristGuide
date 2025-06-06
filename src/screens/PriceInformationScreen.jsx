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
import InputFieldHostForm from '../components/InputFeildHostForm';  
import InputFieldHostFormAge from '../components/InputFeildHostFormAge';  
import Footer from '../components/FooterTwo';  
import { useNavigation } from '@react-navigation/native';  
import AsyncStorage from '@react-native-async-storage/async-storage';

const PriceInformationScreen = () => {  
  const navigation = useNavigation();

  const [pricePerGuest, setPricePerGuest] = useState('');  
  const [ibanNumber, setIbanNumber] = useState('');  
  const [accountHolderName, setAccountHolderName] = useState('');  
  const [estimatedEarnings, setEstimatedEarnings] = useState('0 PKR');  
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Load saved data from AsyncStorage  
  useEffect(() => {  
    const loadPriceInfo = async () => {  
      try {  
        const savedPriceInfo = await AsyncStorage.getItem('priceInfo');  
        if (savedPriceInfo) {  
          const parsedData = JSON.parse(savedPriceInfo);
          
          // Support both old and new field names during transition
          setPricePerGuest(parsedData.pricePerGuest || '');  
          
          // If creditCardNumber exists in saved data, use it for ibanNumber initially
          if (parsedData.creditCardNumber) {
            setIbanNumber(parsedData.creditCardNumber || '');
          } else {
            setIbanNumber(parsedData.ibanNumber || '');
          }
          
          setAccountHolderName(parsedData.accountHolderName || '');  
          setEstimatedEarnings(parsedData.estimatedEarnings || '0 PKR');  
        }  
      } catch (error) {  
        console.error('Error loading price info:', error);  
      }  
    };  
    loadPriceInfo();  
  }, []);

  // Update estimated earnings whenever pricePerGuest changes  
  useEffect(() => {  
    const earnings = pricePerGuest ? `${(pricePerGuest * 0.8).toFixed(2)} PKR` : '0 PKR';  
    setEstimatedEarnings(earnings);  
  }, [pricePerGuest]);

  // Manage keyboard visibility  
  useEffect(() => {  
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

  // Handle 'Next' button click  
  const handleNext = async () => {  
    if (!pricePerGuest || isNaN(pricePerGuest) || Number(pricePerGuest) <= 0) {  
      Alert.alert('Invalid Input', 'Please enter a valid price greater than 0.');  
      return;  
    }
    
    // IBAN validation  
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/; // 2 letters (country), 2 digits (checksum), rest is BBAN

    if (!ibanNumber.trim()) {  
      Alert.alert('Invalid Input', 'Please enter an IBAN number.');  
      return;  
    }

    if (!ibanRegex.test(ibanNumber)) {  
      Alert.alert('Invalid IBAN', 'IBAN must start with a country code (2 letters), followed by 2 numbers and bank/account details.');  
      return;  
    }

    if (ibanNumber.length < 15 || ibanNumber.length > 34) {  
      Alert.alert('Invalid IBAN', 'IBAN should be between 15 and 34 characters long.');  
      return;  
    }

    if (!accountHolderName.trim()) {  
      Alert.alert('Invalid Input', 'Please enter the account holder\'s name.');  
      return;  
    }

    try {  
      await AsyncStorage.setItem(  
        'priceInfo',  
        JSON.stringify({ pricePerGuest, ibanNumber, accountHolderName, estimatedEarnings })  
      );  
      navigation.navigate('ImagesInformationScreen');  
    } catch (error) {  
      Alert.alert('Error', 'Failed to save price information.');  
    }  
  };

  const handleBack = () => {  
    navigation.navigate('ParticipantsInformationScreen');  
  };

  const progress = 66.6 / 16.65;

  return (  
    <SafeAreaView style={styles.container}>  
      <KeyboardAvoidingView  
        style={{ flex: 1 }}  
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  
      >  
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>  
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">  
            <Header imageSource={require('../icons/five.png')} title="Price Info" />  
            <View style={styles.inputContainer}>  
              <Text style={styles.label}>How much will each guest pay?</Text>  
              <InputFieldHostFormAge  
                placeholder="Price per person in PKR"  
                value={pricePerGuest}  
                onChangeText={(text) => setPricePerGuest(text.replace(/[^0-9]/g, ''))}  
              />  
            </View>

            <View style={styles.inputContainer}>  
              <Text style={styles.label}>Your estimated earnings will be...</Text>  
              <Text style={styles.price}>{estimatedEarnings}</Text>  
            </View>

            <View style={styles.inputContainer}>  
              <Text style={styles.label}>Your IBAN number</Text>  
              <InputFieldHostForm  
                placeholder="Enter your IBAN number"  
                value={ibanNumber}  
                onChangeText={(text) => setIbanNumber(text.toUpperCase())}  
                maxLength={34}  
              />  
            </View>

            <View style={styles.inputContainer}>  
              <Text style={styles.label}>Your account holder's name</Text>  
              <InputFieldHostForm  
                placeholder="Enter account holder's name"  
                value={accountHolderName}  
                onChangeText={setAccountHolderName}  
              />  
            </View>  
          </ScrollView>  
        </TouchableWithoutFeedback>

        {!isKeyboardVisible && (  
          <Footer  
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
    flex: 1,  
    backgroundColor: '#ffffff',  
  },  
  scrollContainer: {  
    flexGrow: 1,  
    padding: 20,  
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
  price: {  
    height: 50,  
    paddingHorizontal: 15,  
    fontSize: 16,  
    borderWidth: 1,  
    borderColor: '#ccc',  
    backgroundColor: '#fff',  
    borderRadius: 5,  
    lineHeight: 50,  
    color: '#333',  
    marginTop: 10,  
    marginBottom: 8,  
  },  
});

export default PriceInformationScreen;
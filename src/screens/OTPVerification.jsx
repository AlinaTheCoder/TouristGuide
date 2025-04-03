// OTPVerification.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useToast } from '../../App'

// NEW IMPORTS FOR GOOGLE SIGN-IN
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
// ----------------------------------------------------------------------


import { useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import GoogleButton from '../components/GoogleButton';
import apiInstance from '../config/apiConfig';


const OTPVerification = ({ route, navigation }) => {
  // Retrieve the user details passed from the Signup screen
  const { fullName, email, password } = route.params;
  const toast = useToast();

  // ------------------- States -------------------
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputs = useRef([]);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);


  // NEW: State to track Google login progress
  const [googleLoading, setGoogleLoading] = useState(false);


  // ------------------- useEffect to configure Google Sign-In -------------------
  useEffect(() => {
    async function initGoogle() {
      try {
        // Check if Play Services are available
        const has = await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        if (has) {
          // Configure Google Sign-In
          GoogleSignin.configure({
            offlineAccess: true,
            // Replace with your actual webClientId
            webClientId: '742417803218-r9sqso76qti6iqdkhsgfpj976408105o.apps.googleusercontent.com',
          });
        }
      } catch (err) {
        console.error('Google Sign-In init error:', err);
      }
    }
    initGoogle();
  }, []);
  // ------------------------------------------------------------------------------


  // ------------------- Timer effect for Resend Code -------------------
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);


  // ------------------- Handle OTP Changes -------------------
  const handleChange = (text, index) => {
    if (text.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
    }
  };


  // ------------------- Resend Code -------------------
  const handleResendCode = async () => {
    setTimer(30); // Reset timer to 30 seconds
    try {
      const resendResponse = await apiInstance.post('/email/sendOTP', { email });
      if (resendResponse.data?.message) {
        // Alert.alert('OTP Sent', 'A new OTP has been sent to your email.');
        toast.showSuccess('A new OTP has been sent to your email!');
      } else {
        throw new Error('Failed to resend OTP.');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error || error.message || 'Failed to resend OTP.'
      );
    }
  };


  // ------------------- Verify OTP and Signup -------------------
  const handleContinue = async () => {
    const enteredOTP = otp.join('');
    if (enteredOTP.length !== 4) {
      Alert.alert('Error', 'Please enter the complete 4-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      // 1. Verify the OTP
      const verifyResponse = await apiInstance.post('/email/verifyOTP', {
        email,
        otp: enteredOTP,
      });
      // here
      if (verifyResponse.data?.success === false) {
        Alert.alert('Error', 'Wrong OTP, Signup Unsuccessful!', [
          { text: 'OK', onPress: () => navigation.navigate('Signup') },
        ]);
        setLoading(false);
        return;
      } else if (verifyResponse.data?.message) {
        console.log('[OTPVerification] OTP verified successfully.');
        // 2. Proceed with the signup by calling the existing /signup endpoint
        const signupResponse = await apiInstance.post('/signup', {
          FullName: fullName,
          email: email,
          password: password,
        });
        if (signupResponse.data?.user?.uid) {
          // Alert.alert('Success', 'Signup successful!');
          toast.showSuccess('Signup successful!');
          navigation.navigate('Login');
        } else {
          throw new Error('Invalid response from server during signup.');
        }
      } else {
        throw new Error('OTP verification failed.');
      }
    } catch (error) {
      console.error('[OTPVerification] Error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || error.message || 'Failed to verify OTP and complete signup.'
      );
    } finally {
      setLoading(false);
    }
  };


  // ------------------- Google Login Flow -------------------
  const onGoogleButtonPress = async () => {
    setGoogleLoading(true); // Start the loader
    try {
      // 1. Make sure Google Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // 2. Sign in and retrieve user data
      const data = await GoogleSignin.signIn();
      console.log('[DEBUG] Google SignIn result:', data);
      // 3. Create Firebase credential with Google ID Token
      const googleCredential = auth.GoogleAuthProvider.credential(data.data.idToken);
      console.log('Firebase Credential:', googleCredential);
      // 4. Sign in to Firebase
      const firebaseUser = await auth().signInWithCredential(googleCredential);
      // 5. Send user data to the backend API
      const response = await apiInstance.post('/googleLogin', {
        uid: firebaseUser.user.uid,
        email: firebaseUser.user.email,
        name: firebaseUser.user.displayName,
        type: 0,
        phoneNumber: '',
        cnic: '',
        loginWithGoogle: 1,
      });


      // 6. Save user info locally, alert success, navigate
      await AsyncStorage.setItem('uid', firebaseUser.user.uid);
      Alert.alert('Success', `Welcome, ${firebaseUser.user.displayName}!`);
      await AsyncStorage.setItem('isGoogleUser', 'true');


      navigation.navigate('UserTabs', {
        screen: 'Explore',
      });
    } catch (e) {
      console.error('Google Sign-In Error:', e.message);
      Alert.alert('Error', e.message || 'Something went wrong during Google Sign-In.');
    } finally {
      setGoogleLoading(false); // Stop the loader
    }
  };
  // ------------------------------------------------------------------


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>Enter the code we sent to your email.</Text>


        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={styles.otpBox}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              selectionColor="#D3D3D3"
            />
          ))}
        </View>


        {loading ? (
          <ActivityIndicator size="large" color="#FF5A5F" />
        ) : (
          <CustomButton title="Continue" onPress={handleContinue} />
        )}


        <Text style={styles.orText}>OR</Text>


        {/* Conditionally show loading or Google button */}
        {googleLoading ? (
          <ActivityIndicator size="large" color="#FF5A5F" />
        ) : (
          <GoogleButton onPress={onGoogleButtonPress} />
        )}


        <View style={styles.lineContainer}>
          <View style={styles.line} />
          <Text style={styles.resendText}> Didn’t get the code? </Text>
          {timer > 0 ? (
            <Text style={styles.resendText}>
              Resend Code in <Text style={styles.timerText}>{timer}s</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendCode}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          )}
          <View style={styles.line} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 30,
    color: 'black',
  },
  subtitle: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    fontSize: 24,
    marginHorizontal: 6,
    borderRadius: 10,
  },
  orText: {
    marginVertical: 15,
    fontSize: 16,
    color: '#666',
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
    justifyContent: 'center',
  },
  line: {
    width: '6%',
    height: 1.3,
    backgroundColor: '#ccc',
  },
  resendText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '400',
    color: 'black',
  },
  resendLink: {
    fontSize: 16,
    color: '#FF5A5F',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});


export default OTPVerification;



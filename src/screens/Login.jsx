// src/screens/Login.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import GoogleButton from '../components/GoogleButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

// --------- ONLY CHANGE: we import statusCodes so we can do error?.code checks safely
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import apiInstance from '../config/apiConfig';

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateFields = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!validateEmail(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async () => {
    if (!validateFields()) return;
    setLoading(true);
    try {
      const response = await apiInstance.post('/login', {
        email: email.trim(),
        password: password.trim(),
      });
      if (response.data?.uid) {
        await AsyncStorage.setItem('uid', response.data.uid);
        // For email/password, sign in with Firebase to set currentUser.
        await auth().signInWithEmailAndPassword(email.trim(), password.trim());
        Alert.alert('Success', 'Login successful!');
        setEmail('');
        setPassword('');
        setErrors({});
        navigation.navigate('UserTabs', { screen: 'Explore' });
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (error) {
      // Show network vs server error
      if (!error.response) {
        Alert.alert(
          'Network Error',
          'Unable to reach the server. Please check your internet connection and try again.'
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.error || error.message || 'Failed to log in. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onGoogleButtonPress = async () => {
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const data = await GoogleSignin.signIn();

      // Exactly the same as your original code for credential:
      const googleCredential = auth.GoogleAuthProvider.credential(data.data.idToken);
      const firebaseUser = await auth().signInWithCredential(googleCredential);

      // Then your server-side logic:
      const response = await apiInstance.post('/googleLogin', {
        uid: firebaseUser.user.uid,
        email: firebaseUser.user.email,
        name: firebaseUser.user.displayName,
        type: 0,
        phoneNumber: '',
        cnic: '',
        loginWithGoogle: 1,
      });

      // Save UID, navigate, etc.
      await AsyncStorage.setItem('uid', firebaseUser.user.uid);
      Alert.alert('Success', 'Login Successful!');
      await AsyncStorage.setItem('isGoogleUser', 'true');
      navigation.navigate('UserTabs', { screen: 'Explore' });
    } catch (error) {
      // ---- 1) Log only in dev mode ----
      if (__DEV__) {
        console.log('Google Sign-In Error (dev only):', error);
      }

      // ---- 2) Check error code or message for NETWORK_ERROR, but use "?" to avoid crash
      if (
        error?.code === statusCodes.IN_PROGRESS ||
        error?.code === statusCodes.SIGN_IN_CANCELLED
      ) {
        Alert.alert('Google Sign-In', 'Operation cancelled or already in progress.');
      } else if (
        error?.code === statusCodes.NETWORK_ERROR ||
        (error?.message && error?.message.includes('NETWORK_ERROR'))
      ) {
        Alert.alert(
          'Network Error',
          'Unable to sign in due to network issues. Please check your internet connection and try again.'
        );
      } else {
        Alert.alert('Error', 'Something went wrong during Google Sign-In. Please try again.');
      }

      // ---- 3) Important: do NOT rethrow, do not crash the app ----
      return;
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>LOGIN</Text>
        <InputField
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text.toLowerCase());
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          keyboardType="email-address"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        <InputField
          placeholder="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
          }}
          secureTextEntry
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FF5A5F" />
          </View>
        ) : (
          <CustomButton title="Login" onPress={handleEmailLogin} disabled={loading} />
        )}
        <Text style={styles.orText}>OR</Text>
        {googleLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FF5A5F" />
          </View>
        ) : (
          <GoogleButton onPress={onGoogleButtonPress} />
        )}
        <View style={styles.lineContainer}>
          <View style={styles.line} />
          <View style={styles.noAccountContainer}>
            <Text style={styles.noAccountText}>Don’t have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.line} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FF5A5F', marginBottom: 30 },
  orText: { marginVertical: 15, fontSize: 16, color: '#666' },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
    justifyContent: 'center',
  },
  line: { width: '8%', height: 1.5, backgroundColor: '#ccc' },
  noAccountContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  noAccountText: { fontSize: 16, color: '#666' },
  signupLink: { fontSize: 16, color: '#FF5A5F', fontWeight: 'bold' },
  errorText: { color: 'red', fontSize: 14, alignSelf: 'flex-start', marginBottom: 10, marginLeft: '9%' },
  loaderContainer: { marginTop: 20 },
});

export default Login;

// src/screens/Signup.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import GoogleButton from '../components/GoogleButton';
import apiInstance from '../config/apiConfig';
import { useNavigation } from '@react-navigation/native';

const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

const Signup = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validate form fields
  const validateFields = () => {
    const newErrors = {};
    if (!fullName) newErrors.fullName = 'Full Name is required.';
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Enter a valid email.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // New handleSignup: Send OTP first, then navigate to OTP Verification screen
  const handleSignup = async () => {
    if (!validateFields()) return;
    setLoading(true);
    try {
      // Call the endpoint to send an OTP to the entered email
      const response = await apiInstance.post('/email/sendOTP', { email });
      if (response.data?.message) {
        Alert.alert('OTP Sent', 'Please check your email for the OTP code.');
        // Navigate to OTPVerification screen, passing the entered details
        navigation.navigate('OTPVerification', { fullName, email, password });
      } else {
        throw new Error('Failed to send OTP.');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error || error.message || 'Failed to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>SIGN UP</Text>
      <InputField
        placeholder="Full Name"
        value={fullName}
        onChangeText={(text) => {
          const trimmedText = text.trim();
          setFullName(trimmedText);
          if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
        }}
      />
      {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
      <InputField
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          const trimmedEmail = text.trim().toLowerCase();
          setEmail(trimmedEmail);
          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
        }}
        keyboardType="email-address"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      <InputField
        placeholder="Password"
        value={password}
        onChangeText={(text) => {
          const trimmedPassword = text.trim();
          setPassword(trimmedPassword);
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
        <CustomButton title="Sign Up" onPress={handleSignup} />
      )}
      <View style={styles.lineContainer}>
        <View style={styles.line} />
        <View style={styles.alreadyAccountContainer}>
          <Text style={styles.noAccountText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}> Login</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.line} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF5A5F',
    marginBottom: 30,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginLeft: '9%',
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
    justifyContent: 'center',
  },
  line: {
    width: '8%',
    height: 1.5,
    backgroundColor: '#ccc',
  },
  alreadyAccountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  noAccountText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 20,
  },
  loginLink: {
    fontSize: 16,
    color: '#FF5A5F',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  loaderContainer: {
    marginTop: 20,
  },
});

export default Signup;

// src/screens/Login.jsx  
import React, { useState, useEffect } from 'react';  
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
  ToastAndroid
} from 'react-native';  
import InputField from '../components/InputField';  
import CustomButton from '../components/CustomButton';  
import GoogleButton from '../components/GoogleButton';  
import AsyncStorage from '@react-native-async-storage/async-storage';  
import { useNavigation } from '@react-navigation/native';  
import auth from '@react-native-firebase/auth';  
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';  
import apiInstance from '../config/apiConfig';  
import { useRoute } from '@react-navigation/native';  
import PasswordField from '../components/PasswordField';
import { useToast, showSuccessToast } from '../../App'

const Login = () => {  
  const navigation = useNavigation();  
  const route = useRoute();  
  const [email, setEmail] = useState('');  
  const [password, setPassword] = useState('');  
  const [loading, setLoading] = useState(false);  
  const [googleLoading, setGoogleLoading] = useState(false);  
  const [errors, setErrors] = useState({});
  const toast = useToast(); // Use hook for functional components

  // Add at the top of Login component after useState declarations  
useEffect(() => {  
  // Initialize Google Sign-In configuration  
  GoogleSignin.configure({  
    webClientId: '742417803218-r9sqso76qti6iqdkhsgfpj976408105o.apps.googleusercontent.com',  
    offlineAccess: false  
  });  
}, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {  
    const handleGoogleSignInRedirect = async () => {  
      if (route.params?.triggerGoogleSignIn) {  
        const emailToUse = route.params.email || '';  
        console.log('Auto-triggering Google sign-in for:', emailToUse);  
         
        setEmail(emailToUse);  
         
        // Small delay to ensure the component is fully mounted  
        setTimeout(() => {  
          onGoogleButtonPress(emailToUse);  
        }, 800); // Increased delay for better reliability  
      }  
    };  
     
    handleGoogleSignInRedirect();  
  }, [route?.params]);

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
      console.log("Attempting login for email:", email.trim());  
       
      // First check if email is associated with Google  
      try {  
        console.log("Checking if email is associated with Google...");  
        const checkResponse = await apiInstance.post('/checkEmailProvider', { email: email.trim() });  
        console.log("Check response:", JSON.stringify(checkResponse.data));  
         
        // If this is a Google account, show alert and offer Google sign-in  
        if (checkResponse.data?.isGoogleAccount) {  
          Alert.alert(  
            'Google Account Detected',  
            `This email "${email.trim()}" is associated with Google.`,  
            [  
              {  
                text: 'Cancel',  
                style: 'cancel',  
              },  
              {  
                text: 'Sign In with Google',  
                onPress: () => onGoogleButtonPress(email.trim()),  
              },  
            ]  
          );  
          setLoading(false);  
          return;  
        }  
      } catch (checkError) {  
        console.log("Error checking email provider:", checkError);  
        // Continue with login attempt even if check fails  
      }  
       
      // Continue with normal login  
      console.log("Proceeding with email/password login");  
      const response = await apiInstance.post('/login', {  
        email: email.trim(),  
        password: password.trim(),  
      });  
       
      if (response.data?.uid) {  
        await AsyncStorage.setItem('uid', response.data.uid);  
        // ADDED THIS LINE: Explicitly set isGoogleUser to 'false' for email/password login  
        await AsyncStorage.setItem('isGoogleUser', 'false');  
         
        // For email/password, sign in with Firebase to set currentUser  
        await auth().signInWithEmailAndPassword(email.trim(), password.trim());  
        toast.showSuccess('Login successful!');
        setEmail('');  
        setPassword('');  
        setErrors({});  
        navigation.navigate('UserTabs', { screen: 'Explore' });
      } else {  
        throw new Error('Invalid response from server.');  
      }  
    } catch (error) {  
      // Handle expected error cases with specific messaging
      const errorMessage = error.response?.data?.error || error.message || 'Failed to log in. Please try again.';
      const isAccountNotFound = error.response?.data?.accountNotFound || errorMessage.includes('Account does not exist');
      
      // Use appropriate logging based on error type
      if (isAccountNotFound) {
        console.log("Login attempt with unregistered account:", email.trim());
      } else {
        console.log("Login error:", error);
      }
      
      // Show network vs server error  
      if (!error.response) {  
        Alert.alert(  
          'Network Error',  
          'Unable to reach the server. Please check your internet connection and try again.'  
        );  
      } else {  
        Alert.alert(  
          'Error',  
          errorMessage,
          [
            {
              text: 'OK',
              onPress: () => {
                // If error is about account not existing, clear fields and navigate to signup
                if (isAccountNotFound) {
                  setEmail('');
                  setPassword('');
                  setErrors({});
                  navigation.navigate('Signup');
                } else if (errorMessage.includes('Incorrect password')) {
                  // Clear only password field for wrong password
                  setPassword('');
                }
              }
            }
          ]
        );  
      }  
    } finally {  
      setLoading(false);  
    }  
  };

const onGoogleButtonPress = async (specificEmail = null) => {  
  setGoogleLoading(true);  
  try {  
    // Get the email to use (either passed in or from the email field)  
    const emailToUse = specificEmail || email.trim();  
    console.log('Starting Google Sign-In process for:', emailToUse);  
     
    // Enhanced Google Sign-In configuration  
    GoogleSignin.configure({  
      webClientId: '742417803218-r9sqso76qti6iqdkhsgfpj976408105o.apps.googleusercontent.com',  
      offlineAccess: false,  
      forceCodeForRefreshToken: true,  
      loginHint: emailToUse,  
      accountName: emailToUse,  
    });  
     
    // Check Google Play Services availability  
    await GoogleSignin.hasPlayServices({  
      showPlayServicesUpdateDialog: true  
    });  
     
    // Clear previous sessions  
    await GoogleSignin.signOut();  
     
    // Sign in with Google  
    const userInfo = await GoogleSignin.signIn({  
      loginHint: emailToUse  
    });  
     
    console.log('Google Sign-In successful');  
     
    // Extract ID token  
    const idToken = userInfo.idToken || (userInfo.data && userInfo.data.idToken);  
     
    if (!idToken) {  
      throw new Error('Google Sign-In successful but no ID token was returned');  
    }  
     
    // Create Firebase credential  
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);  
     
    // Sign in with Firebase  
    const firebaseUser = await auth().signInWithCredential(googleCredential);  
     
    console.log('Firebase auth successful for:', firebaseUser.user.email);  
     
    // Ensure we have a valid displayName  
    let displayName = firebaseUser.user.displayName;  
     
    // If Firebase doesn't provide a name, try to get it from Google user info  
    if (!displayName) {  
      if (userInfo.user && userInfo.user.name) {  
        displayName = userInfo.user.name;  
      } else if (userInfo.data && userInfo.data.user && userInfo.data.user.name) {  
        displayName = userInfo.data.user.name;  
      }  
    }  
     
    // If we still don't have a name, use a default  
    if (!displayName) {  
      displayName = 'Google User';  
    }  
     
    console.log('Sending user data to backend:', {  
      uid: firebaseUser.user.uid,  
      email: firebaseUser.user.email,  
      name: displayName  
    });  
     
    // Call backend API with validated data  
    const response = await apiInstance.post('/googleLogin', {  
      uid: firebaseUser.user.uid,  
      email: firebaseUser.user.email,  
      name: displayName,  
      type: 0,  
      loginWithGoogle: 1  
    });  
     
    console.log('Backend response:', response.data);  
     
    // Save user data  
    await AsyncStorage.setItem('uid', firebaseUser.user.uid);  
    await AsyncStorage.setItem('isGoogleUser', 'true');  
     
    toast.showSuccess('Login successful!');
    navigation.navigate('UserTabs', { screen: 'Explore' });
     
  } catch (error) {  
    console.error('Google Sign-In Error:', error);  
     
    // Check specifically for API errors to provide better feedback  
    if (error.isAxiosError && error.response) {  
      console.log('API Error details:', error.response.data);  
      Alert.alert(  
        'Login Error',  
        error.response.data?.error || 'Failed to complete login process with the server'  
      );  
    } else if (error.code === statusCodes.SIGN_IN_CANCELLED) {  
      Alert.alert('Cancelled', 'Sign-in was cancelled');  
    } else if (error.code === statusCodes.IN_PROGRESS) {  
      Alert.alert('In Progress', 'Sign-in operation is already in progress');  
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {  
      Alert.alert('Error', 'Play Services not available or outdated');  
    } else {  
      Alert.alert(  
        'Sign-In Error',  
        `Unable to sign in with Google: ${error.message}. Please try again.`  
      );  
    }  
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
        <PasswordField  
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
            <Text style={styles.noAccountText}>Don't have an account? </Text>  
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
  loaderContainer: { marginTop: 20, backgroundColor: 'white' },  
});

export default Login;
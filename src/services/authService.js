// src/services/authService.js
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from '../config/apiConfig';

// Initialize Google Sign-In
export const initGoogleSignIn = async () => {
  try {
    // Check if Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Configure Google Sign-In with correct web client ID
    GoogleSignin.configure({
      webClientId: '742417803218-r9sqso76qti6iqdkhsgfpj976408105o.apps.googleusercontent.com',
      offlineAccess: false,
    });
    
    return true;
  } catch (error) {
    console.error('Google Sign-In initialization error:', error);
    return { success: false, error: error.message };
  }
};

// Check what authentication methods are available for an email
export const getSignInMethodsForEmail = async (email) => {
  try {
    const response = await apiInstance.post('/auth/checkEmail', { email });
    return response.data;
  } catch (error) {
    console.error('Error checking email:', error);
    return { exists: false, providers: [] };
  }
};

// Sign in with email and password
export const signInWithEmailPassword = async (email, password) => {
  try {
    // First, check if this email exists with only Google auth
    const emailCheck = await getSignInMethodsForEmail(email);
    
    if (emailCheck.exists && 
        emailCheck.providers.includes('google.com') && 
        !emailCheck.providers.includes('password')) {
      return {
        success: false,
        error: 'google_only',
        message: 'This email is registered with Google. Please sign in with Google instead.'
      };
    }
    
    // Sign in with Firebase Auth
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    
    // Get the Firebase ID token
    const token = await userCredential.user.getIdToken();
    
    // Authenticate with our backend
    const response = await apiInstance.post('/auth/authenticate', { 
      token,
      email,
      loginMethod: 'email'
    });
    
    // Save authentication data to AsyncStorage - BOTH FORMATS FOR COMPATIBILITY
    await AsyncStorage.setItem('uid', userCredential.user.uid);
    await AsyncStorage.setItem('authMethod', 'email');
    await AsyncStorage.setItem('isGoogleUser', 'false'); // For backward compatibility
    
    return {
      success: true,
      user: response.data
    };
  } catch (error) {
    console.error('Email/password sign-in error:', error);
    
    let errorMessage = 'Failed to sign in with email and password.';
    let errorCode = error.code || 'unknown';
    
    // Map Firebase error codes to user-friendly messages
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address format.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed login attempts. Please try again later.';
    }
    
    return {
      success: false,
      error: errorCode,
      message: errorMessage
    };
  }
};

export const signInWithGoogle = async () => {
    try {
      // First sign out to ensure a fresh login
      await GoogleSignin.signOut();
      
      // Start Google Sign-In flow
      const userInfo = await GoogleSignin.signIn();
      
      console.log('Google Sign-In response:', JSON.stringify(userInfo)); // For debugging
      
      // Extract the ID token - checking all possible locations
      let idToken = null;
      
      // Check all possible token locations
      if (userInfo?.idToken) {
        idToken = userInfo.idToken;
      } else if (userInfo?.user?.idToken) {
        idToken = userInfo.user.idToken;
      } else if (userInfo?.data?.idToken) {
        idToken = userInfo.data.idToken;
      } else if (userInfo?.serverAuthCode) {
        // If we have a serverAuthCode but no token, we might need to exchange it
        console.log('Only serverAuthCode available, may need exchange');
        // For now, we'll consider this an error condition
      }
      
      if (!idToken) {
        console.error('No ID token found in Google response:', userInfo);
        return {
          success: false,
          error: 'no_token',
          message: 'Failed to get authentication token from Google. Please try again.'
        };
      }
      
      // Create a Google credential for Firebase
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Sign in to Firebase with the Google credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      // Get the email and name from wherever they're available
      const email = userCredential.user.email;
      const displayName = userCredential.user.displayName || 
                           userInfo?.user?.name ||
                           userInfo?.data?.user?.name || 
                           'User';
      
      // Get Firebase ID token for our backend
      const firebaseToken = await userCredential.user.getIdToken();
      
      // Authenticate with our backend
      const response = await apiInstance.post('/auth/authenticate', {
        token: firebaseToken,
        email: email,
        name: displayName,
        loginMethod: 'google'
      });
      
      // Save authentication data to AsyncStorage
      await AsyncStorage.setItem('uid', userCredential.user.uid);
      await AsyncStorage.setItem('authMethod', 'google');
      await AsyncStorage.setItem('isGoogleUser', 'true'); // For backward compatibility
      
      return {
        success: true,
        user: response.data
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      // Safe error handling
      let errorMessage = 'An unexpected error occurred during Google sign-in.';
      
      // Only try to access error properties if error exists
      if (error) {
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Google Sign-In specific error codes
        if (error.code === 'SIGN_IN_CANCELLED') {
          return {
            success: false,
            error: 'cancelled',
            message: 'Sign-in was cancelled'
          };
        } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
          errorMessage = 'Google Play Services are not available or outdated';
        }
      }
      
      return {
        success: false,
        error: 'google_signin_failed',
        message: errorMessage
      };
    }
  };

// Create a new account with email and password
export const createEmailAccount = async (email, password, fullName) => {
  try {
    // Check if email already exists with any provider
    const emailCheck = await getSignInMethodsForEmail(email);
    
    if (emailCheck.exists) {
      if (emailCheck.providers.includes('google.com')) {
        return {
          success: false,
          error: 'email_exists_google',
          message: 'This email is already registered using Google. Please sign in with Google.'
        };
      } else if (emailCheck.providers.includes('password')) {
        return {
          success: false,
          error: 'email_exists_password',
          message: 'This email is already registered. Please log in with your password.'
        };
      }
    }
    
    // Email verification is handled separately with OTP
    // For now, just return success so the OTP flow can continue
    return {
      success: true,
      email: email,
      fullName: fullName,
      password: password
    };
  } catch (error) {
    console.error('Create account error:', error);
    
    return {
      success: false,
      error: error.code || 'unknown',
      message: error.message || 'Failed to create account.'
    };
  }
};

// Complete email signup after OTP verification
export const completeEmailSignup = async (email, password, fullName) => {
  try {
    // Create the user in Firebase
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    
    // Get Firebase ID token
    const token = await userCredential.user.getIdToken();
    
    // Register with our backend
    const response = await apiInstance.post('/auth/register', {
      token,
      email,
      fullName,
      loginMethod: 'email'
    });
    
    return {
      success: true,
      user: response.data
    };
  } catch (error) {
    console.error('Complete signup error:', error);
    
    let errorMessage = 'Failed to complete signup.';
    
    // Map Firebase error codes to user-friendly messages
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address format.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use a stronger password.';
    }
    
    return {
      success: false,
      error: error.code || 'unknown',
      message: errorMessage
    };
  }
};

// Sign out from all providers
export const signOut = async () => {
  try {
    // Get the auth method used
    const authMethod = await AsyncStorage.getItem('authMethod');
    const isGoogleUser = await AsyncStorage.getItem('isGoogleUser');
    
    // If signed in with Google, sign out from Google as well
    if (authMethod === 'google' || isGoogleUser === 'true') {
      await GoogleSignin.signOut();
    }
    
    // Sign out from Firebase
    await auth().signOut();
    
    // Clear AsyncStorage - BOTH FORMATS FOR COMPATIBILITY
    await AsyncStorage.removeItem('uid');
    await AsyncStorage.removeItem('authMethod');
    await AsyncStorage.removeItem('isGoogleUser'); // For backward compatibility
    
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    
    return {
      success: false,
      error: error.code || 'unknown',
      message: error.message || 'Failed to sign out.'
    };
  }
};

// Get current authenticated user
export const getCurrentUser = async () => {
  const user = auth().currentUser;
  
  if (!user) {
    return null;
  }
  
  const token = await user.getIdToken();
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    token: token
  };
};
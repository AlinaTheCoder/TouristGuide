// src/utils/notificationService.js
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import apiInstance from '../config/apiConfig';

/**
 * Request notification permissions
 * @returns {Promise<boolean>} Whether permissions were granted
 */
export const requestNotificationPermission = async () => {
  try {
    // Request permission for Android (Android 13+ requires explicit permission)
    if (Platform.OS === 'android') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    }
    return true;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
};

/**
 * Register the device with FCM and get a token
 * @returns {Promise<string|null>} FCM token or null if failed
 */
export const registerFCMToken = async () => {
  try {
    // Check if user is logged in
    const userId = await AsyncStorage.getItem('uid');
    if (!userId) {
      console.log('User not logged in, skipping FCM registration');
      return null;
    }

    // Enable FCM auto-initialization
    await messaging().setAutoInitEnabled(true);

    // Get the token
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('FCM Token:', fcmToken);
      
      // Save token to local storage for convenience
      await AsyncStorage.setItem('fcmToken', fcmToken);
      
      // Send to backend
      await sendTokenToBackend(userId, fcmToken);
      
      return fcmToken;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
};

/**
 * Send FCM token to backend
 * @param {string} userId User ID
 * @param {string} token FCM token
 */
const sendTokenToBackend = async (userId, token) => {
  try {
    // Create an endpoint for updating FCM token
    await apiInstance.post('/user/update-fcm-token', {
      userId,
      fcmToken: token
    });
    console.log('FCM token sent to backend successfully');
  } catch (error) {
    console.error('Failed to send FCM token to backend:', error);
  }
};

/**
 * Handle a message received when app is in foreground
 * @param {Object} remoteMessage The message received
 */
export const onForegroundMessage = (remoteMessage) => {
  console.log('Message received in foreground:', remoteMessage);
  // You can add custom notification display here if needed
};

/**
 * Configure the notification channel for Android
 * This is required for Android 8.0+ but we'll skip dynamic creation
 * since the channel is defined in the AndroidManifest.xml
 */
export const createNotificationChannels = () => {
  // Channel is already defined in AndroidManifest.xml
  // We'll skip programmatic creation to avoid API compatibility issues
  console.log('Using notification channel defined in AndroidManifest.xml');
};

/**
 * Initialize FCM and set up listeners
 * @param {Function} onNotificationOpen Callback for when notification is opened
 */
export const initializeNotifications = async (onNotificationOpen) => {
  try {
    // Skip channel creation as it's defined in manifest
    
    // Request permission if not already granted
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return null;
    }
    
    // Register device with FCM
    await registerFCMToken();
    
    // Set up token refresh listener
    messaging().onTokenRefresh(async (token) => {
      console.log('FCM Token refreshed:', token);
      const userId = await AsyncStorage.getItem('uid');
      if (userId) {
        await sendTokenToBackend(userId, token);
      }
    });
    
    // Set up foreground message handler
    const unsubscribeForeground = messaging().onMessage(onForegroundMessage);
    
    // Set up notification opened handler when app is in background
    messaging().onNotificationOpenedApp(onNotificationOpen);
    
    // Check if app was opened from a notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
          // Wait a moment to ensure navigation is ready
          setTimeout(() => {
            onNotificationOpen(remoteMessage);
          }, 1000);
        }
      });
    
    return unsubscribeForeground;
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
    return null;
  }
};
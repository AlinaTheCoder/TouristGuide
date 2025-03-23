// src/screens/AuthLoading.js
import React, { useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

const AuthLoading = () => {
  const navigation = useNavigation();
  
  // Create animated values for logo and text
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the animations immediately
    const animationDuration = 800;
    
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: animationDuration,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: animationDuration,
        delay: 300, // Slight delay for text appearance
        easing: Easing.ease,
        useNativeDriver: true
      })
    ]).start();

    // Run authentication check without a timeout that could conflict
    const checkSession = async () => {
      try {
        // 1. Retrieve the stored UID from AsyncStorage
        const storedUid = await AsyncStorage.getItem('uid');

        // 2. Get the current Firebase user
        const currentUser = auth().currentUser;

        // 3. Triple verification: both must exist and match
        if (storedUid && currentUser && currentUser.uid === storedUid) {
          // If session is valid, navigate to Explore (inside UserTabs)
          navigation.reset({
            index: 0,
            routes: [{ name: 'UserTabs', params: { screen: 'Explore' } }],
          });
        } else {
          // If not, reset to Login screen
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      } catch (error) {
        console.error('Error checking session:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    };

    // Add a small delay before checking session to ensure animations start
    // This gives the splash screen time to appear and animate
    const timer = setTimeout(() => {
      checkSession();
    }, 500);

    return () => clearTimeout(timer);
  }, [navigation, logoScale, logoOpacity, textOpacity]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../images/logo.png')}
        style={[
          styles.logo,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity
          }
        ]}
        resizeMode="contain"
      />
      <Animated.Text
        style={[
          styles.appName,
          {
            opacity: textOpacity
          }
        ]}
      >
        TouristGuide
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 180, // Slightly larger logo
    height: 180,
  },
  appName: {
    marginTop: 20,
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FF5A5F',
    letterSpacing: 0.7,
  },
});

export default AuthLoading;
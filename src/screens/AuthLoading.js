// src/screens/AuthLoading.js
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

const AuthLoading = () => {
  const navigation = useNavigation();

  useEffect(() => {
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

    checkSession();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF5A5F" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthLoading;

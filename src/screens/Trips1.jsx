// screens/Trips1.js
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from '../config/apiConfig';

import TripsBlock from '../components/TripsBlock';
import NoTrips from '../components/NoTrips';

export default function Trips() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  // Handler for the edit icon
  const handleEdit = (activity) => {
    navigation.navigate('AvailabilityScheduleDetails', { activity });
  };

  // Fetch the current user's trips
  const fetchUserTrips = async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('uid');
      if (!userId) {
        setActivities([]);
        setIsLoading(false);
        return;
      }

      // Fetch from /trips/user/:userId
      // In fetchUserTrips function
      const response = await apiInstance.get(`/trips/user/${userId}?nocache=${Date.now()}`);
      const data = response.data;
      setActivities(data.trips || []);
    } catch (err) {
      console.error('[Trips1] Error fetching user trips:', err);
      setActivities([]);

      // --- Network vs. Server Error for user feedback ---
      if (!err.response) {
        Alert.alert(
          'Network Error',
          'Unable to reach the server. Please check your internet connection and try again.'
        );
      } else {
        Alert.alert(
          'Error',
          err.response.data?.error ||
            err.response.data?.message ||
            err.message ||
            'Failed to load trips. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // UseFocusEffect so that when this screen is focused, we refetch the user's trips
  useFocusEffect(
    useCallback(() => {
      fetchUserTrips();
    }, [])
  );

  const renderActivity = ({ item }) => (
    <TripsBlock
      activity={item}
      onEdit={() => handleEdit(item)}
    />
  );

  // No trips (only show after loading is complete)
  if (!isLoading && activities.length === 0) {
    return <NoTrips />;
  }

  // Render trips list
  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={<Text style={styles.headerText}>Trips</Text>}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  headerText: {
    fontSize: 38,
    fontWeight: '600',
    color: 'black',
    marginVertical: 20,
    textAlign: 'left',
    marginLeft: 19,
    marginTop: 67,
    marginBottom: 25,
    letterSpacing: 0.6,
  },
  listContainer: {
    paddingBottom: 100,
    paddingHorizontal: 12,
  }
});
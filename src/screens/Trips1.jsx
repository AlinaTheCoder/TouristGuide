// screens/Trips1.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

  useEffect(() => {
    const fetchUserTrips = async () => {
      try {
        setIsLoading(true);
        const userId = await AsyncStorage.getItem('uid');
        if (!userId) {
          setActivities([]);
          return;
        }

        // Fetch from /trips/user/:userId
        const response = await apiInstance.get(`/trips/user/${userId}`);
        const data = response.data;
        setActivities(data.trips || []);
      } catch (err) {
        console.error('[Trips1] Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTrips();
  }, []);

  const renderActivity = ({ item }) => (
    <TripsBlock 
      activity={item} 
      onEdit={() => handleEdit(item)} 
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text style={styles.loadingText}>Loading Trips...</Text>
      </View>
    );
  }

  if (activities.length === 0) {
    return <NoTrips />;
  }

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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 15, 
    fontSize: 16, 
    color: '#FF5A5F',
  },
});

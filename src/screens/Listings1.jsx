// listings/Listings1.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socket from '../config/socketConfig';
import apiInstance from '../config/apiConfig';

import HostsListingsPost from '../components/HostsListingsPost';
import NoListing from '../components/NoListing';

export default function Listings1() {
  const navigation = useNavigation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hostId, setHostId] = useState('');

  // 1) Grab hostId from AsyncStorage
  useEffect(() => {
    const fetchUid = async () => {
      try {
        const storedUid = await AsyncStorage.getItem('uid');
        if (storedUid) {
          setHostId(storedUid);
        } else {
          Alert.alert('Error', 'No UID found. Please log in.');
        }
      } catch (err) {
        console.error('Error fetching UID:', err);

        // Distinguish network vs. server error (if you want)
        // For now, we just do a single alert
        Alert.alert('Error', 'Failed to retrieve UID.');
      }
    };
    fetchUid();
  }, []);

  // 2) Setup socket listeners once we have a valid hostId
  useEffect(() => {
    if (!hostId) return;

    const handleActivitiesChanged = (payload) => {
      const { activityId, updatedData } = payload;
      if (updatedData?.hostId === hostId) {
        console.log('[Socket] Relevant activity changed:', activityId, updatedData);
        fetchListings();
      }
    };
    socket.on('activities-changed', handleActivitiesChanged);

    return () => {
      socket.off('activities-changed', handleActivitiesChanged);
    };
  }, [hostId]);

  // 3) Re-fetch every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (hostId) {
        fetchListings();
      }
    }, [hostId])
  );

  // 4) Fetch listings from API
  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await apiInstance.get(`/getAllListedActivitiesByHostId/${hostId}`);
      console.log('[DEBUG] API Response:', response.data);

      if (response.data.success && response.data.data.length > 0) {
        const formattedListings = response.data.data.map((activity) => ({
          id: activity.id,
          status: activity.status,
          images: activity.images.map((imageUrl) => ({ uri: imageUrl })),
          caption: `You have listed activity on ${formatDate(activity.createdAt)}`,
          address: activity.address,
          city: activity.city,
        }));
        setListings(formattedListings);
      } else {
        setListings([]);
      }
    } catch (err) {
      console.error('[ERROR] Fetching Listings:', err);
      setError(err);

      // --- Network vs. Server Error Handling ---
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
            'Failed to fetch listings. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // 5) Helper: Format "createdAt" to "Month Day, Year"
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Loading
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text style={styles.loadingText}>Loading Listings...</Text>
      </View>
    );
  }

  // No listings
  if (!loading && listings.length === 0) {
    return <NoListing />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Listings</Text>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('ActivityInformationScreen')}
        >
          <Image source={require('../icons/Plus.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {listings.map((post, index) => (
        <HostsListingsPost
          key={index}
          status={post.status}
          images={post.images}
          caption={post.caption}
          address={post.address}
          city={post.city}
          onPress={() =>
            navigation.navigate('HostActivityDetails', {
              activityId: post.id,
            })
          }
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: 'white',
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 38,
    fontWeight: '600',
    color: 'black',
    marginBottom: 8,
    marginTop: -13,
    marginLeft: 17,
  },
  iconContainer: {
    position: 'absolute',
    right: 25,
    top: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eaeaea',
    borderRadius: 25,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  loaderContainer: {
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

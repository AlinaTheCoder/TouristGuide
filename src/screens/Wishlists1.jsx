// Wishlists.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from '../config/apiConfig'; // Import your axios instance
import PostActivity from '../components/PostActivity';
import NoWishlist from '../components/NoWishlist';

export default function Wishlists() {
  const navigation = useNavigation();
  const [wishlistActivities, setWishlistActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // 1) Load current user ID once
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const uid = await AsyncStorage.getItem('uid');
        console.log('[Wishlists] Loaded userId:', uid);
        setUserId(uid);
      } catch (error) {
        console.error('[Wishlists] Error loading user ID:', error);
        setLoading(false);
      }
    };
    loadUserId();
  }, []);

  // 2) On screen focus, fetch wishlist from Node server
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!userId) {
          // If no user, just stop loading
          setLoading(false);
          return;
        }
        try {
          setLoading(true);
          const response = await apiInstance.get(`/getFullWishlistActivities/${userId}`);
          if (response.data.success) {
            setWishlistActivities(response.data.data);
          } else {
            setWishlistActivities([]);
          }
        } catch (err) {
          console.error('[Wishlists] Error fetching from server:', err);
          setWishlistActivities([]);

          // --- Network vs. server error for user feedback ---
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
                'Failed to fetch wishlist. Please try again.'
            );
          }
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [userId])
  );

  // 3) Navigate to detail screen
  const handlePress = (activityId) => {
    navigation.navigate('ActivityDetails', { activityId });
  };

  // 4) Group activities into rows of 2
  const groupedData = [];
  for (let i = 0; i < wishlistActivities.length; i += 2) {
    groupedData.push(wishlistActivities.slice(i, i + 2));
  }

  // 5) Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text style={styles.loadingText}>Loading Wishlists...</Text>
      </View>
    );
  }

  // 6) If no activities => show NoWishlist
  if (wishlistActivities.length === 0) {
    return (
      <View style={styles.container}>
        <NoWishlist />
      </View>
    );
  }

  // 7) Otherwise, render the FlatList
  return (
    <View style={styles.container}>
      <FlatList
        data={groupedData}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.map((activity) => (
              <View key={activity.id} style={styles.item}>
                <PostActivity
                  image={{ uri: activity.activityImages[0] }}
                  caption={activity.activityTitle}
                  onPress={() => handlePress(activity.id)}
                />
              </View>
            ))}
          </View>
        )}
        keyExtractor={(item, index) => `row-${index}`}
        ListHeaderComponent={<Text style={styles.headerText}>Wishlists</Text>}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingBottom: 20 },
  headerText: {
    fontSize: 38,
    fontWeight: '600',
    color: 'black',
    marginVertical: 20,
    textAlign: 'left',
    marginLeft: 20,
    marginTop: 65,
    marginBottom: 25,
    letterSpacing: 0.6,
  },
  listContainer: { paddingHorizontal: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  item: {
    flex: 1,
    marginHorizontal: 10,
    maxWidth: '48%',
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

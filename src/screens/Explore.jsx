// Explore.jsx - Updated with chat functionality
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { ScrollView, View, Alert, StyleSheet, Text } from 'react-native';
import TopSection from '../components/TopSection';
import PostSection from '../components/PostSection';
import SearchScreen from './SearchScreen';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import apiInstance from '../config/apiConfig';
import NoExploreActivity from '../components/NoExploreActivity';
import socket from '../config/socketConfig';
import { WishlistContext } from '../contexts/WishlistContext';

const Explore = () => {
  const navigation = useNavigation();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track if an error occurred, e.g. for potential UI usage
  const [error, setError] = useState(null);

  // For category filtering
  const [selectedCategory, setSelectedCategory] = useState('');
  const { wishlistIds, loadWishlist } = useContext(WishlistContext);

  // ------------------- Fetch Activities (with optional category) -------------------
  const fetchActivities = useCallback(async (category = '') => {
    try {
      setLoading(true);
      setError(null); // Reset any previous error
      const response = await apiInstance.get('/getAllListedExploreActivities', {
        params: { category },
      });

      if (response.data.success && response.data.data.length > 0) {
        console.log('[DEBUG] Fetched Activities:', response.data.data);

        const formattedActivities = response.data.data.map((activity) => ({
          id: activity.id,
          PostImages: activity.activityImages.map((imgUrl) => ({ uri: imgUrl })),
          PostCaption: activity.activityTitle,
          PostDate: formatDateRange(activity.dateRange),
          activityCategory: activity.activityCategory,
        }));
        setActivities(formattedActivities);
      } else {
        // If no activities or success=false, just setActivities to empty
        setActivities([]);
      }
    } catch (err) {
      console.error('[ERROR] Fetching Explore Activities:', err);
      setError(err);

      // --- Network vs. Server error check ---
      if (!err.response) {
        Alert.alert(
          'Network Error',
          'Unable to reach the server. Please check your internet connection and try again.'
        );
      } else {
        Alert.alert(
          'Error',
          err.response.data?.message ||
          err.message ||
          'Failed to fetch activities. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------- Initial & Category-based Fetch -------------------
  useEffect(() => {
    fetchActivities(selectedCategory);
  }, [fetchActivities, selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      fetchActivities(selectedCategory);
    }, [selectedCategory, fetchActivities])
  );

  // ------------------- Socket.IO Realtime Updates -------------------
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to realtime updates via Socket.IO');
    });

    socket.on('exploreActivitiesUpdate', (data) => {
      console.log('Realtime update received:', data);
      if (data && data.success && data.data) {
        let formattedActivities = data.data.map((activity) => ({
          id: activity.id,
          PostImages: activity.activityImages.map((imgUrl) => ({ uri: imgUrl })),
          PostCaption: activity.activityTitle,
          PostDate: formatDateRange(activity.dateRange),
          likedStatus: activity.likedStatus,
          activityCategory: activity.activityCategory,
        }));

        // If a category is selected, filter by activityCategory
        if (selectedCategory) {
          formattedActivities = formattedActivities.filter(
            (item) => item.activityCategory === selectedCategory
          );
        }

        setActivities(formattedActivities);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from realtime updates');
    });

    return () => {
      socket.off('connect');
      socket.off('exploreActivitiesUpdate');
      socket.off('disconnect');
    };
  }, [selectedCategory]);

  // ------------------- Formatting Helpers -------------------
  const formatDateRange = (dateRange) => {
    if (!dateRange || typeof dateRange !== 'object' || !dateRange.startDate || !dateRange.endDate) {
      return 'No Date';
    }
    const getMonthAbbreviation = (isoDate) => {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      const dateObj = new Date(isoDate);
      return `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`;
    };
    const formattedStartDate = getMonthAbbreviation(dateRange.startDate);
    const formattedEndDate = getMonthAbbreviation(dateRange.endDate);
    return `${formattedStartDate} - ${formattedEndDate}`;
  };

  const isActivityLiked = (activityId) => {
    return !!wishlistIds[activityId];
  };

  useFocusEffect(
    useCallback(() => {
      loadWishlist();
      return () => { };
    }, [loadWishlist])
  );

  // When user selects a category from TopSection
  const handleCategorySelect = (category) => {
    // If the user taps the same category again, toggle back to '' (i.e., show all)
    setSelectedCategory((prev) => (prev === category ? '' : category));
  };

  // Handle chat icon press
  const handleChatPress = () => {
    navigation.navigate('ChatScreen');
  };

  // ------------------- Render -------------------
  return (
    <ScrollView style={styles.container} showsHorizontalScrollIndicator={false}>
      <TopSection
        onIconPress={() => navigation.navigate(SearchScreen)}
        onOtherPress={() => navigation.navigate(SearchScreen)}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        onChatPress={handleChatPress} // Add this prop
      />

      {!loading && activities.length === 0 ? (
        <NoExploreActivity />
      ) : (
        <View style={styles.container1}>
          {activities.map((activity, index) => (
            <PostSection
              key={index}
              activityId={activity.id}
              PostImages={activity.PostImages}
              PostCaption={activity.PostCaption}
              PostDate={activity.PostDate}
              onPress={() => navigation.navigate('ActivityDetails', {
                activityId: activity.id,
                from: 'Explore'  // Add this line
              })}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: { backgroundColor: 'white' },
  container1: { marginBottom: 90 }
});
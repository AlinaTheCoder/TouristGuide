// Explore.js
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { ScrollView, View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
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
  const [error, setError] = useState(null);
  // New state for category filtering
  const [selectedCategory, setSelectedCategory] = useState('');
  const { wishlistIds, loadWishlist } = useContext(WishlistContext);

  // Fetch activities from the server with optional category filter
  const fetchActivities = useCallback(async (category = '') => {
    try {
      setLoading(true);
      const response = await apiInstance.get('/getAllListedExploreActivities', {
        params: { category },
      });
      if (response.data.success && response.data.data.length > 0) {
        console.log("[DEBUG] Fetched Activities:", response.data.data);
        const formattedActivities = response.data.data.map(activity => ({
          id: activity.id,
          PostImages: activity.activityImages.map(imgUrl => ({ uri: imgUrl })),
          PostCaption: activity.activityTitle,
          PostDate: formatDateRange(activity.dateRange),
          activityCategory: activity.activityCategory, // include category in mapping
        }));
        setActivities(formattedActivities);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error("[ERROR] Fetching Explore Activities:", err);
      setError(err);
      Alert.alert("Error", "Failed to fetch activities. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities(selectedCategory);
  }, [fetchActivities, selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      fetchActivities(selectedCategory);
    }, [selectedCategory, fetchActivities])
  );

  // Socket.IO realtime updates
  useEffect(() => {
    socket.on('connect', () => {
      console.log("Connected to realtime updates via Socket.IO");
    });

    socket.on('exploreActivitiesUpdate', (data) => {
      console.log("Realtime update received:", data);
      if (data && data.success && data.data) {
        let formattedActivities = data.data.map(activity => ({
          id: activity.id,
          PostImages: activity.activityImages.map(imgUrl => ({ uri: imgUrl })),
          PostCaption: activity.activityTitle,
          PostDate: formatDateRange(activity.dateRange),
          likedStatus: activity.likedStatus,
          activityCategory: activity.activityCategory, // include category
        }));

        // If a category is selected, filter by activityCategory
        if (selectedCategory) {
          formattedActivities = formattedActivities.filter(item =>
            item.activityCategory === selectedCategory
          );
        }

        setActivities(formattedActivities);
      }
    });

    socket.on('disconnect', () => {
      console.log("Disconnected from realtime updates");
    });

    return () => {
      socket.off('connect');
      socket.off('exploreActivitiesUpdate');
      socket.off('disconnect');
    };
  }, [selectedCategory]);

  const formatDateRange = (dateRange) => {
    if (!dateRange || typeof dateRange !== "object" || !dateRange.startDate || !dateRange.endDate) {
      return "No Date";
    }
    const getMonthAbbreviation = (isoDate) => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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

  // Callback for when a user selects a category from TopSection
  const handleCategorySelect = (category) => {
    setSelectedCategory(prev => (prev === category ? '' : category));
  };

  return (
    <ScrollView style={styles.container} showsHorizontalScrollIndicator={false}>
      <TopSection
        onIconPress={() => navigation.navigate(SearchScreen)}
        onOtherPress={() => navigation.navigate(SearchScreen)}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <>
          {activities.length === 0 ? (
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
                  onPress={() => navigation.navigate("ActivityDetails", { activityId: activity.id })}
                />
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: { backgroundColor: 'white' },
  container1: { marginBottom: 90 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
});

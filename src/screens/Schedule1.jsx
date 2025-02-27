import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from '../config/apiConfig';
import ScheduleAvailability from '../components/ScheduleAvailability';
import NoSchedule from '../components/NoSchedule';

/**
 * Helper: Convert ISO date string -> e.g. "Feb 18, 2025"
 */
function formatDate(isoString) {
  if (!isoString) return 'N/A';
  const dateObj = new Date(isoString);
  if (isNaN(dateObj.getTime())) return 'N/A';
  const parts = dateObj.toString().split(' '); // ["Wed","Feb","18","2025","..."]
  return `${parts[1]} ${parts[2]}, ${parts[3]}`; // "Feb 18, 2025"
}

/**
 * Helper: Convert ISO date string -> e.g. "08:00 AM"
 */
function formatTime(isoString) {
  if (!isoString) return 'N/A';
  const dateObj = new Date(isoString);
  if (isNaN(dateObj.getTime())) return 'N/A';
  // toLocaleTimeString with hour/minute options
  return dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Transform the raw activity from FRDB to your UI's "item" shape:
 *   { id, image, title, startDate, endDate, startTime, endTime }
 */
function mapActivityToUI(activity) {
  return {
    id: activity.activityId, // for FlatList key
    image: activity.activityImages && activity.activityImages.length > 0
      ? { uri: activity.activityImages[0] }
      : require('../images/post1.jpg'), // fallback
    title: activity.activityTitle || 'Untitled',
    startDate: formatDate(activity?.dateRange?.startDate),
    endDate: formatDate(activity?.dateRange?.endDate),
    startTime: formatTime(activity?.startTime), // or "N/A"
    endTime: formatTime(activity?.endTime),
    // Keep raw activity if you need it:
    original: activity,
  };
}

export default function Schedule1() {
  const navigation = useNavigation();
  const route = useRoute();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch from /schedule/host/:hostId
  const fetchActivities = async () => {
    console.log('[DEBUG - Schedule1] fetchActivities called');
    setLoading(true);
    setError(null);

    try {
      const hostId = await AsyncStorage.getItem('uid');
      if (!hostId) {
        console.log('[DEBUG - Schedule1] No hostId found in AsyncStorage');
        setActivities([]);
        setLoading(false);
        return;
      }

      const response = await apiInstance.get(`/schedule/host/${hostId}`);
      const fetched = response.data || [];

      // Map each raw record to your UI shape
      const mapped = fetched.map(mapActivityToUI);
      setActivities(mapped);
    } catch (err) {
      console.error('[ERROR - Schedule1] Failed to fetch activities:', err.message);
      setError('Failed to load schedule.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when screen is focused and check for updatedActivity from details screen
  useFocusEffect(
    React.useCallback(() => {
      fetchActivities();
      if (route.params?.updatedActivity) {
        const updatedUI = mapActivityToUI(route.params.updatedActivity);
        setActivities((prev) =>
          prev.map((act) => (act.id === updatedUI.id ? updatedUI : act))
        );
        // Clear the updatedActivity param so it doesn't reapply on future focus
        navigation.setParams({ updatedActivity: undefined });
      }
    }, [route.params?.updatedActivity])
  );

  // On edit -> go to details (removed onActivityUpdated callback)
  const handleEdit = (item) => {
    navigation.navigate('AvailabilityScheduleDetails', {
      activity: item.original,
    });
  };

  const renderActivity = ({ item }) => (
    <ScheduleAvailability activity={item} onEdit={() => handleEdit(item)} />
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  if (!loading && activities.length === 0) {
    return <NoSchedule />;
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={<Text style={styles.headerText}>Schedule</Text>}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    margin: 20,
    textAlign: 'center',
  },
  headerText: {
    fontSize: 38,
    fontWeight: '600',
    color: 'black',
    marginVertical: 20,
    textAlign: 'left',
    marginLeft: 18,
    marginTop: 65,
    marginBottom: 25,
    letterSpacing: 0.6,
  },
  listContainer: {
    paddingBottom: 100,
    paddingHorizontal: 12,
  },
});

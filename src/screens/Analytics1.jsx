// screens/Analytics1.js
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,

} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


import PostViewBookings from '../components/PostViewBookings';
import NoAnalytics from '../components/NoAnalytics';
import apiInstance from '../config/apiConfig';


// Get screen height for responsive calculations (same as in NoAnalytics)
const { height } = Dimensions.get('window');


// ----------------------------------------------------------------
// Helpers for date/time/category
// ----------------------------------------------------------------
const formatDate = (dateKey) => {
  if (!dateKey) return '';
  const parts = dateKey.split('-'); // ["2025","03","27"]
  if (parts.length !== 3) return dateKey;
  const [year, month, day] = parts.map((p) => parseInt(p, 10));
  if (!year || !month || !day) return dateKey;


  const dateObj = new Date(year, month - 1, day);
  if (isNaN(dateObj.getTime())) return dateKey;


  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return dateObj.toLocaleDateString(undefined, options);
};


const formatTime = (slotString) => {
  if (!slotString) return '';
  return slotString.replace(/_/g, ' ');
};


const categorizeBooking = (booking) => {
  if (!booking.bookingDate) return 'Upcoming';


  const parts = booking.bookingDate.split('-');
  if (parts.length !== 3) return 'Upcoming';


  const [year, month, day] = parts.map((p) => parseInt(p, 10));
  const dateObj = new Date(year, month - 1, day);
  if (isNaN(dateObj.getTime())) return 'Upcoming';


  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);


  const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());


  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Currently hosting';
  } else if (dateOnly.getTime() < todayOnly.getTime()) {
    return 'Checking out';
  } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
    return 'Arriving soon';
  } else {
    return 'Upcoming';
  }
};
// ----------------------------------------------------------------


export default function Analytics1() {
  // Changed default active tab to 'Currently hosting'
  const [activeTab, setActiveTab] = useState('Currently hosting');
  const [hostName, setHostName] = useState('');
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);


  // useFocusEffect -> retrieve hostId from AsyncStorage, fetch analytics
  useFocusEffect(
    useCallback(() => {
      const fetchBookings = async () => {
        try {
          setLoading(true);


          // 1) Get the current host's ID from AsyncStorage
          const hostId = await AsyncStorage.getItem('uid');
          if (!hostId) {
            // If no host ID, user isn't recognized => show NoAnalytics
            setHostName('');
            setAllBookings([]);
            return;
          }


          // 2) Make the request to /analytics/host/:hostId
          const response = await apiInstance.get(`/analytics/host/${hostId}`);
          const data = response.data;
          if (data) {
            setHostName(data.hostName || '');
            setAllBookings(data.bookings || []);
          }
        } catch (error) {
          console.log('[Analytics1] Error fetching analytics data:', error);


          // --- Network vs. Server Error Handling ---
          if (!error.response) {
            Alert.alert(
              'Network Error',
              'Unable to reach the server. Please check your internet connection and try again.'
            );
          } else {
            Alert.alert(
              'Error',
              error.response.data?.error ||
              error.response.data?.message ||
              error.message ||
              'Failed to fetch analytics data. Please try again.'
            );
          }
          setAllBookings([]);
        } finally {
          setLoading(false);
        }
      };


      fetchBookings();
    }, [])
  );


  // Count total
  const totalBookings = allBookings.length;


  // If no bookings => NoAnalytics
  if (!loading && totalBookings === 0) {
    return <NoAnalytics hostName={hostName} />;
  }


  // Filter by activeTab
  const filteredBookings = allBookings.filter(
    (booking) => categorizeBooking(booking).toLowerCase() === activeTab.toLowerCase()
  );


  // Count how many in each category
  // Reordered categories array as requested
  const categories = ['Currently hosting', 'Arriving soon', 'Upcoming', 'Checking out'];
  const countsByCategory = {};
  categories.forEach((cat) => {
    countsByCategory[cat] = allBookings.filter(
      (b) => categorizeBooking(b).toLowerCase() === cat.toLowerCase()
    ).length;
  });


  // Custom message for "no bookings" in the selected tab - similar to NoAnalytics
  const getNoBookingsMessage = () => {
    switch (activeTab) {
      case 'Currently hosting':
        return "You don't have any guests staying with you right now.";
      case 'Arriving soon':
        return "You don't have any guests arriving today or tomorrow.";
      case 'Upcoming':
        return "You currently don't have any upcoming guests.";
      case 'Checking out':
        return "You don't have any guests checking out today or tomorrow.";
      default:
        return "You don't have any guests for this time period.";
    }
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Welcome Section */}
      <Text style={styles.welcomeText}>Welcome, {hostName}!</Text>
      <View style={styles.block}>
        {/* Your Reservations Section */}
        <Text style={styles.reservationsText}>Your Reservations</Text>


        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {categories.map((tabLabel) => (
            <TouchableOpacity
              key={tabLabel}
              style={[styles.tab, activeTab === tabLabel && styles.activeTab]}
              onPress={() => setActiveTab(tabLabel)}
            >
              <Text style={activeTab === tabLabel ? styles.tabTextActive : styles.tabText}>
                {tabLabel} ({countsByCategory[tabLabel]})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>


      {/* If no bookings in this tab => show NoAnalytics style message with image */}
      {filteredBookings.length === 0 ? (
        <View style={styles.block}>
          <View style={[styles.noReservationContainer, { marginBottom: 90, marginTop: 23 }]}>
            <Image source={require('../icons/forbidden.png')} style={styles.image} />
            <Text style={styles.noReservationText}>{getNoBookingsMessage()}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          {filteredBookings.map((booking) => {
            // Format date/time
            const bookingDateFormatted = formatDate(booking.bookingDate);
            const timeSlotFormatted = formatTime(booking.timeSlot);


            return (
              <PostViewBookings
                key={booking.bookingId}
                PostImages={booking.activityImages}
                PostCaption={booking.activityTitle}
                PostGuests={booking.totalGuestsBooked?.toString() || '0'}
                PostDate={bookingDateFormatted}
                PostTime={timeSlotFormatted}
                PostBookedBy={booking.userName}
              />
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingBottom: 60,
    marginBottom: 8
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 38,
    fontWeight: '600',
    color: '#000',
    marginVertical: 20,
    textAlign: 'left',
    marginLeft: 20,
    marginTop: 65,
    marginBottom: 25,
    letterSpacing: 0.6,
  },
  block: {
    marginHorizontal: 22,
  },
  reservationsText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  tab: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 5,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  activeTab: {
    borderColor: '#000000',
    borderWidth: 1,
  },
  tabText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
  // Added NoAnalytics style container and text styles
  noReservationContainer: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 80,
    minHeight: height * 0.4, // Responsive fixed height equivalent to 40%
  },
  image: {
    width: 25,
    height: 25,
    marginBottom: 10,
  },
  noReservationText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 40,
    lineHeight: 16
  },
  // Original styles
  noBookingsText: {
    marginVertical: 20,
    fontSize: 16,
    color: '#888',
    marginHorizontal: 20,
    textAlign: 'center',
  },
});



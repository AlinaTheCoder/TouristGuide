import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateRangePicker from "../components/DateRangePicker2";
import CategorySelector from '../components/CategorySelector';
import { useRoute, useNavigation } from "@react-navigation/native";
import apiInstance from "../config/apiConfig";
import { useStripe } from '@stripe/stripe-react-native';

const ConfirmAndPay = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { activityId } = route.params;

  // State
  const [dateRange, setDateRange] = useState({ selectedDate: null });
  const [slotOptions, setSlotOptions] = useState([]);
  const [timeSlot, setTimeSlot] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slotLoading, setSlotLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [dayFullyBooked, setDayFullyBooked] = useState(false);
  const [remainingDayCapacity, setRemainingDayCapacity] = useState(null);
  const [maxGuestsPerDay, setMaxGuestsPerDay] = useState(null);

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // 1) Clear old stored data if activityId changes
  useEffect(() => {
    const resetPersistedValues = async () => {
      try {
        await AsyncStorage.removeItem('selectedDate');
        await AsyncStorage.removeItem('guestCount');
        await AsyncStorage.removeItem('selectedTimeSlot');
      } catch (err) {
        console.log("[ConfirmAndPay] Error clearing old AsyncStorage values:", err);
      }
      setDateRange({ selectedDate: null });
      setTimeSlot('');
      setGuestCount(1);
    };

    resetPersistedValues();
  }, [activityId]);

  // 2) Retrieve user UID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUid = await AsyncStorage.getItem('uid');
        if (storedUid) {
          setUserId(storedUid);
          console.log("[ConfirmAndPay] UID from AsyncStorage:", storedUid);
        } else {
          console.log("[ConfirmAndPay] No UID in AsyncStorage.");
        }
      } catch (err) {
        console.log("[ConfirmAndPay] Error retrieving UID:", err);
      }
    };
    fetchUserId();
  }, []);

  // 3) Load stored date/time/guest – if you want to keep them for the same activity
  useEffect(() => {
    const loadPersistedValues = async () => {
      try {
        const storedDate = await AsyncStorage.getItem('selectedDate');
        if (storedDate) {
          setDateRange({ selectedDate: new Date(storedDate) });
        }
        const storedGuestCount = await AsyncStorage.getItem('guestCount');
        if (storedGuestCount) {
          setGuestCount(parseInt(storedGuestCount, 10));
        }
        const storedTimeSlot = await AsyncStorage.getItem('selectedTimeSlot');
        if (storedTimeSlot) {
          setTimeSlot(storedTimeSlot);
        }
      } catch (e) {
        console.log("Error loading persisted values:", e);
      }
    };
    loadPersistedValues();
  }, []);

  // 4) Fetch activity details
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        const response = await apiInstance.get(`/activityDetails/${activityId}`);
        if (response.data.success) {
          setActivityData(response.data.data);
        } else {
          throw new Error("Failed to fetch activity data");
        }
      } catch (err) {
        console.error("Error fetching activity data:", err);
        // Distinguish network vs. server error
        if (!err.response) {
          Alert.alert(
            "Network Error",
            "Unable to reach the server. Please check your internet connection and try again."
          );
        } else {
          Alert.alert(
            "Error",
            err.response?.data?.error ||
            err.response?.data?.message ||
            err.message ||
            "Failed to load activity data."
          );
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchActivityData();
  }, [activityId]);

  // 5) Re-fetch time slots when date or guestCount changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!dateRange.selectedDate || !activityData) return;
      try {
        setSlotLoading(true);
        const dateString = formatDateForAPI(dateRange.selectedDate);
        const response = await apiInstance.get(
          `/getTimeSlots/${activityId}?date=${dateString}&requestedGuests=${guestCount}`
        );
        if (response.data.success) {
          const {
            timeSlots,
            dayFullyBooked: isDayFullyBooked,
            remainingDayCapacity,
            maxGuestsPerDay
          } = response.data.data;
          setDayFullyBooked(isDayFullyBooked);
          setRemainingDayCapacity(remainingDayCapacity);
          setMaxGuestsPerDay(maxGuestsPerDay);
          const mapped = timeSlots.map(slot => ({
            label: `${slot.display} (${slot.remaining} remaining)`,
            value: slot.slotId
          }));
          setSlotOptions(mapped);
        } else {
          Alert.alert("Error", response.data.message || "Unable to fetch time slots");
        }
      } catch (err) {
        console.error("Error fetching time slots:", err);
        // Distinguish network vs. server error
        if (!err.response) {
          Alert.alert(
            "Network Error",
            "Unable to reach the server. Please check your internet connection and try again."
          );
        } else {
          Alert.alert(
            "Error",
            err.response?.data?.error ||
            err.response?.data?.message ||
            err.message ||
            "Failed to retrieve available slots"
          );
        }
      } finally {
        setSlotLoading(false);
      }
    };
    fetchSlots();
  }, [dateRange.selectedDate, activityData, guestCount]);

  // Helpers
  const formatDateForAPI = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  if (error || !activityData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Unable to load activity details: {error || "No data available"}
        </Text>
      </View>
    );
  }

  // 6) Updating guest count
  const increaseGuests = () => {
    if (dateRange.selectedDate && remainingDayCapacity !== null && guestCount >= remainingDayCapacity) {
      Alert.alert(
        "Guest Limit Reached",
        `For this date, you can only book up to ${remainingDayCapacity} guests due to daily capacity limits.`
      );
      return;
    }
    if (guestCount >= activityData.maxGuestsPerTime) {
      Alert.alert(
        "Maximum Guests Reached",
        `You cannot add more than ${activityData.maxGuestsPerTime} guests for this activity.`
      );
      return;
    }
    const newCount = guestCount + 1;
    setGuestCount(newCount);
    AsyncStorage.setItem('guestCount', newCount.toString()).catch(e => console.log("Error saving guest count:", e));
  };

  const decreaseGuests = () => {
    if (guestCount > 1) {
      const newCount = guestCount - 1;
      setGuestCount(newCount);
      AsyncStorage.setItem('guestCount', newCount.toString()).catch(e => console.log("Error saving guest count:", e));
    }
  };

  // 7) Handle time slot selection
  const handleTimeSlotChange = (value) => {
    setTimeSlot(value);
    AsyncStorage.setItem('selectedTimeSlot', value).catch(e => console.log("Error saving time slot:", e));
  };

  // 8) Proceed to Payment
  const isFormValid = () => {
    return (
      dateRange.selectedDate &&
      timeSlot &&
      guestCount > 0 &&
      userId &&
      !dayFullyBooked &&
      (!remainingDayCapacity || guestCount <= remainingDayCapacity)
    );
  };

  const handleProceedToCheckout = async () => {
    try {
      if (!dateRange.selectedDate || !timeSlot || !userId) {
        Alert.alert("Error", "Please select all required fields before proceeding.");
        return;
      }
      const dateString = formatDateForAPI(dateRange.selectedDate);
      const payload = { date: dateString, slotId: timeSlot, requestedGuests: guestCount, userId };
      console.log("[ConfirmAndPay] Initiating payment...");
      setLoading(true);
  
      const paymentResponse = await apiInstance.post(`/createPaymentIntent/${activityId}`, payload);
      if (!paymentResponse.data.success) {
        throw new Error(paymentResponse.data.message);
      }
      const { paymentIntentId, clientSecret } = paymentResponse.data;
  
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Tourist Guide App",
        appearance: {
          colors: {
            background: '#FFFFFF',
            componentBackground: '#FFFFFF',
            primaryText: '#000000',
            secondaryText: '#6B7280',
            componentText: '#000000',
            placeholderText: '#6B7280',
            componentBorder: '#E5E5E5',
            componentDivider: '#E5E5E5',
            icon: '#000000',
            primary: '#Ff5a5f'
          },
          shapes: { borderRadius: 5 }
        }
      });
      if (initError) {
        throw new Error(initError.message);
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      const { error: paymentError } = await presentPaymentSheet();
      if (paymentError) {
        throw new Error(paymentError.message);
      }
      console.log("[ConfirmAndPay] Payment successful. Finalizing booking...");
  
      // Add payment intent ID to the payload for the booking
      payload.paymentIntentId = paymentIntentId;
  
      // First create the booking
      const bookingResponse = await apiInstance.post(`/bookTimeSlot/${activityId}`, payload);
  
      if (bookingResponse.data.success) {
        console.log("[ConfirmAndPay] Booking completed successfully");
        
        // Navigate to BookingConfirmed screen directly without showing alert
        navigation.navigate('BookingConfirmed');
        // We don't set loading to false here since we're navigating away
      } else {
        throw new Error(bookingResponse.data.message || "Failed to complete booking");
      }
  
    } catch (error) {
      console.error("[ConfirmAndPay] Error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
      setLoading(false); // Only set loading to false on error
    }
  };

  const proceedDisabled = dayFullyBooked;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../icons/BackArrow.png')} style={styles.headerImage} />
        </TouchableOpacity>

        <Text style={styles.headerText}>Book Activity</Text>
      </View>

      <View style={styles.experienceCard}>
        {activityData.activityImages && activityData.activityImages.length > 0 ? (
          <Image source={{ uri: activityData.activityImages[0] }} style={styles.experienceImage} />
        ) : (
          <Image source={require("../images/post1.jpg")} style={styles.experienceImage} />
        )}
        <View style={styles.experienceInfo}>
          <Text style={styles.experienceTitle}>{activityData.activityTitle}</Text>
          <Text style={styles.experienceThings}>
            {activityData.address}, {activityData.city}
          </Text>
          <Text style={styles.experienceThings}>{activityData.duration}</Text>
        </View>
      </View>
      <View style={styles.horizontalLine} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Booking Preferences</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Guests</Text>
            <Text style={styles.guestSubLabel}>{guestCount} Guests</Text>
          </View>
          <View style={styles.guestSection}>
            <TouchableOpacity
              style={[styles.guestButton, guestCount === 1]}
              onPress={decreaseGuests}
              disabled={guestCount === 1}
            >
              <Image source={require("../icons/minus.png")} style={styles.icon} />
            </TouchableOpacity>
            <Text style={styles.guestCount}>{guestCount}</Text>
            <TouchableOpacity style={styles.guestButton} onPress={increaseGuests}>
              <Image source={require("../icons/add.png")} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label1}>Date</Text>
        </View>
        <DateRangePicker
          selectedDate={dateRange.selectedDate}
          onDateRangeChange={setDateRange}
          minAllowedDate={activityData.dateRange?.startDate}
          maxAllowedDate={activityData.dateRange?.endDate}
          activityId={activityId}  // Pass the activityId prop
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label1}>Time</Text>
      </View>
      {slotLoading ? (
        <ActivityIndicator size="small" color="#FF5A5F" style={{ marginBottom: 10 }} />
      ) : (
        <>
          {dayFullyBooked ? (
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessageText}>
                {`The date ${dateRange.selectedDate ? formatDateForAPI(dateRange.selectedDate) : ''} is fully booked.`}
              </Text>
            </View>
          ) : (
            <CategorySelector
              selectedCategory={timeSlot}
              onSelectCategory={handleTimeSlotChange}
              categories={slotOptions}
            />
          )}
        </>
      )}
      <View style={styles.horizontalLine} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Details</Text>
        <Text style={styles.priceDetails}>
          Rs. {activityData.pricePerGuest} x {guestCount} guests
        </Text>
        <View style={styles.lineContainer}>
          <View style={styles.horizontalLine1} />
        </View>
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total (PKR)</Text>
          <Text style={styles.totalValue}>
            Rs. {(+activityData.pricePerGuest * guestCount).toFixed(0)}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.button,
            (!isFormValid() && {
              backgroundColor: '#FFB5B8',
              borderColor: '#FFB5B8',
              opacity: 0.9
            })
          ]}
          onPress={handleProceedToCheckout}
          disabled={!isFormValid()}
        >
          <Text style={[styles.buttonText, (!isFormValid() && { color: '#fff' })]}>
            Proceed to Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ConfirmAndPay;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    position: 'absolute',
    top: -7,
    left: 0,
    right: 0,
    zIndex: 1,
    width: '100%',
    height: 45,
    paddingHorizontal: 10,
    marginBottom: 50
  },
  headerImage: { width: 18, height: 18, marginTop: -9, marginLeft: -8 },
  headerText: { fontSize: 16, fontWeight: '500', color: '#000', textAlign: 'center', flex: 1, marginTop: -9, marginLeft: -13 },
  experienceCard: { flexDirection: "row", borderRadius: 8, padding: 8, marginBottom: 16, marginTop: 65 },
  experienceImage: { width: 92, height: 92, borderRadius: 8, marginRight: 17 },
  experienceInfo: { flex: 1, justifyContent: "center" },
  experienceTitle: { fontSize: 18, fontWeight: "600", marginBottom: 4, color: "black", letterSpacing: 0.2, width: "106%" },
  experienceThings: { fontSize: 14, color: "gray", marginBottom: 4 },
  horizontalLine: { height: 8, backgroundColor: "#EAECED", width: "150%", marginLeft: -20, marginTop: 6 },
  dropdown: { marginTop: -10, marginBottom: 10 },
  section: { marginBottom: 15, padding: 8, marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: "600", marginBottom: 19, color: "black" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  column: { flexDirection: "column" },
  guestSection: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start" },
  guestButton: { width: 35, height: 35, alignItems: "center", justifyContent: "center", marginBottom: 10, marginRight: -5, marginTop: 8 },
  disabledButton: { backgroundColor: '#ccc', borderColor: '#ccc' },
  icon: { width: 18, height: 18 },
  guestCount: { fontSize: 18, fontWeight: "bold", color: "black", marginHorizontal: 0.5, textAlign: "center", width: 24, marginBottom: 10, marginLeft: 9, marginTop: 7 },
  priceDetails: { fontSize: 14, color: "grey", fontWeight: "400", marginBottom: 15 },
  label1: { fontSize: 16, color: "black", fontWeight: "500" },
  label: { fontSize: 16, color: "black", fontWeight: "500", marginBottom: 10 },
  guestSubLabel: { fontSize: 14, color: "gray", marginBottom: 15 },
  value: { fontSize: 14 },
  lineContainer: { alignItems: "center", width: "100%" },
  horizontalLine1: { height: 1, backgroundColor: "#ccc", width: "104%", marginBottom: 20 },
  totalLabel: { fontSize: 16, fontWeight: "500", color: 'black' },
  totalValue: { fontSize: 16, fontWeight: "500", color: 'black' },
  button: { width: '100%', height: 50, borderRadius: 5, borderWidth: 2, borderColor: '#FF5A5F', justifyContent: 'center', alignItems: 'center', marginTop: 25, backgroundColor: '#FF5A5F', marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorText: { color: "red", fontSize: 16, textAlign: "center" },
  errorMessageContainer: { backgroundColor: '#FFE8E8', padding: 12, borderRadius: 6, marginBottom: 10 },
  errorMessageText: { color: '#FF5A5F', fontSize: 14, textAlign: 'center' }
});
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import TimePicker from '../components/TimePicker2';
import ScheduleDateRangePicker from '../components/ScheduleDateRangePiker'; 

import InputFieldHostFormAge from '../components/InputFieldHostFormAge';
import ScheduleCustomButton from '../components/ScheduleCustomButton';
import CategorySelector from '../components/CategorySelector';
import apiInstance from '../config/apiConfig';

export default function AvailabilityScheduleDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { activity } = route.params || {}; // Removed onActivityUpdated from here

  // Preload date range from activity.dateRange
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: activity?.dateRange?.startDate || null,
    endDate: activity?.dateRange?.endDate || null,
  });

  // Times
  const [selectedStartTime, setSelectedStartTime] = useState(activity?.startTime || '');
  const [selectedEndTime, setSelectedEndTime] = useState(activity?.endTime || '');
  // Duration
  const [duration, setDuration] = useState(activity?.duration || '');
  const [maxGuestsPerDay, setMaxGuestsPerDay] = useState(activity?.maxGuestsPerDay || '');
  const [maxGuestsPerTime, setMaxGuestsPerTime] = useState(activity?.maxGuestsPerTime || '');
  const [pricePerGuest, setPricePerGuest] = useState(activity?.pricePerGuest || '');
  const [estimatedEarnings, setEstimatedEarnings] = useState(activity?.estimatedEarnings || '');

  // listingStatus -> radio
  const [selectedOption, setSelectedOption] = useState(() => {
    switch (activity?.listingStatus) {
      case 'List': return 1;
      case 'Unlist': return 2;
      case 'Deactivate': return 3;
      default: return null;
    }
  });

  // For the top area
  const titlee = activity?.activityTitle || 'Unknown Title';
  const address = activity?.address || 'Unknown Address';
  const city = activity?.city || 'Unknown City';
  const imageSource = activity?.activityImages?.length
    ? { uri: activity.activityImages[0] }
    : require('../images/post1.jpg'); // fallback

  // Full set of durations
  const durationOptions = [
    { label: '30 minutes', value: '30 minutes' },
    { label: '1 hour', value: '1 hour' },
    { label: '1.5 hours', value: '1.5 hours' },
    { label: '2 hours', value: '2 hours' },
    { label: '2.5 hours', value: '2.5 hours' },
    { label: '3 hours', value: '3 hours' },
    { label: '3.5 hours', value: '3.5 hours' },
    { label: '4 hours', value: '4 hours' },
    { label: '4.5 hours', value: '4.5 hours' },
    { label: '5 hours', value: '5 hours' },
    { label: '5.5 hours', value: '5.5 hours' },
    { label: '6 hours', value: '6 hours' },
    { label: '6.5 hours', value: '6.5 hours' },
    { label: '7 hours', value: '7 hours' },
    { label: '7.5 hours', value: '7.5 hours' },
    { label: '8 hours', value: '8 hours' },
    { label: '8.5 hours', value: '8.5 hours' },
    { label: '9 hours', value: '9 hours' },
    { label: '9.5 hours', value: '9.5 hours' },
    { label: '10 hours', value: '10 hours' },
    { label: '10.5 hours', value: '10.5 hours' },
    { label: '11 hours', value: '11 hours' },
    { label: '11.5 hours', value: '11.5 hours' },
    { label: '12 hours', value: '12 hours' },
    { label: '12.5 hours', value: '12.5 hours' },
    { label: '13 hours', value: '13 hours' },
    { label: '13.5 hours', value: '13.5 hours' },
    { label: '14 hours', value: '14 hours' },
    { label: '14.5 hours', value: '14.5 hours' },
    { label: '15 hours', value: '15 hours' },
    { label: '15.5 hours', value: '15.5 hours' },
    { label: '16 hours', value: '16 hours' },
    { label: '16.5 hours', value: '16.5 hours' },
    { label: '17 hours', value: '17 hours' },
    { label: '17.5 hours', value: '17.5 hours' },
    { label: '18 hours', value: '18 hours' },
    { label: '18.5 hours', value: '18.5 hours' },
    { label: '19 hours', value: '19 hours' },
    { label: '19.5 hours', value: '19.5 hours' },
    { label: '20 hours', value: '20 hours' },
    { label: '20.5 hours', value: '20.5 hours' },
    { label: '21 hours', value: '21 hours' },
    { label: '21.5 hours', value: '21.5 hours' },
    { label: '22 hours', value: '22 hours' },
    { label: '22.5 hours', value: '22.5 hours' },
    { label: '23 hours', value: '23 hours' },
    { label: '23.5 hours', value: '23.5 hours' },
    { label: '24 hours', value: '24 hours' },
  ];

  // Recompute estimatedEarnings if price changes
  useEffect(() => {
    if (pricePerGuest) {
      const newEarnings = (parseFloat(pricePerGuest) * 0.8).toFixed(2) + ' PKR';
      setEstimatedEarnings(newEarnings);
    } else {
      setEstimatedEarnings('');
    }
  }, [pricePerGuest]);

  // ---------------------------
  // Helper function to compare dates
  const areDatesEqual = (date1, date2) => {
    if (!date1 && !date2) return true;
    if (!date1 || !date2) return false;
    return new Date(date1).toISOString() === new Date(date2).toISOString();
  };

  // Compare current state vs. original activity values.
  const formChanged = (
    !areDatesEqual(selectedDateRange.startDate, activity?.dateRange?.startDate) ||
    !areDatesEqual(selectedDateRange.endDate, activity?.dateRange?.endDate) ||
    selectedStartTime !== (activity?.startTime || '') ||
    selectedEndTime !== (activity?.endTime || '') ||
    duration !== (activity?.duration || '') ||
    maxGuestsPerDay !== (activity?.maxGuestsPerDay || '') ||
    maxGuestsPerTime !== (activity?.maxGuestsPerTime || '') ||
    pricePerGuest !== (activity?.pricePerGuest || '') ||
    ((activity?.listingStatus === 'List' ? 1 : activity?.listingStatus === 'Unlist' ? 2 : activity?.listingStatus === 'Deactivate' ? 3 : null) !== selectedOption)
  );
  // ---------------------------

  // "Save" button handler with guests-per-time check
  const handleSave = async () => {
    console.log('[DEBUG - handleSave] Activity ID =', activity?.activityId);
    console.log('[DEBUG - handleSave] Current selectedDateRange =', selectedDateRange);

    // Ensure numeric values are valid and check guest counts
    const guestsPerDayNumber = parseInt(maxGuestsPerDay, 10);
    const guestsPerTimeNumber = parseInt(maxGuestsPerTime, 10);
    if (isNaN(guestsPerDayNumber) || isNaN(guestsPerTimeNumber)) {
      Alert.alert('Error', 'Please enter valid numeric values for guests per day and guests per time.');
      return;
    }
    if (guestsPerTimeNumber >= guestsPerDayNumber) {
      Alert.alert('Error', 'Guests per time should be less than guests per day.');
      return;
    }

    let listingStatusText = '';
    switch (selectedOption) {
      case 1: listingStatusText = 'List'; break;
      case 2: listingStatusText = 'Unlist'; break;
      case 3: listingStatusText = 'Deactivate'; break;
      default: listingStatusText = '';
    }

    try {
      if (!activity?.activityId) {
        Alert.alert('Error', 'Activity ID not found.');
        return;
      }

      // Build data for PUT
      const dataToUpdate = {
        dateRange: {
          startDate: selectedDateRange.startDate,
          endDate: selectedDateRange.endDate,
        },
        startTime: selectedStartTime || '',
        endTime: selectedEndTime || '',
        duration: duration || '',
        maxGuestsPerDay,
        maxGuestsPerTime,
        pricePerGuest,
        estimatedEarnings,
        listingStatus: listingStatusText,
        address,
        city,
      };

      console.log('[DEBUG - handleSave] Data to update =>', dataToUpdate);

      // Send to backend
      const res = await apiInstance.put(`/schedule/${activity.activityId}`, dataToUpdate);
      console.log('[DEBUG - handleSave] Update response =>', res.data);

      // Instead of calling a callback, navigate back with the updated activity data
      navigation.navigate('HostTabs', { 
        screen: 'Schedule', 
        params: { 
          updatedActivity: {
            ...activity,
            ...dataToUpdate,
            listingStatus: listingStatusText,
          }
        } 
      });

      Alert.alert('Success', 'Activity schedule updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Optionally, you can also navigate back here if needed.
          },
        },
      ]);
    } catch (error) {
      console.error('[ERROR - handleSave]', error.message);
      Alert.alert('Error', 'Failed to update activity. Please try again.');
    }
  };

  // ---------------------------
  // Render
  return (
    <ScrollView>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('HostTabs', { screen: 'Schedule' })}>
            <Image source={require('../icons/BackArrow.png')} style={styles.headerImage} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Schedule Availability</Text>
        </View>

        {/* Activity Info */}
        <View style={styles.row}>
          <Image source={imageSource} style={styles.activityImage} />
          <View style={styles.detailRow}>
            <Text style={styles.title}>{titlee}</Text>
            <Text style={styles.location}>{address}</Text>
            <Text style={styles.city}>{city}</Text>
            <View style={styles.inlineRow}>
              <Text style={styles.penny}>Rs. {pricePerGuest || '0'}    |    </Text>
              <Image source={require('../icons/sand-glass.png')} style={styles.icon} />
              <Text style={styles.penny}>{duration || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.horizontalLine} />

        {/* Schedule */}
        <View style={styles.scheduleContainer}>
          <Text style={styles.subheading}>Your Schedule</Text>

          <Text style={styles.subsubheading}>Dates</Text>
          <View style={styles.inputContainer2}>
            <ScheduleDateRangePicker
              dateRange={selectedDateRange}
              onDateRangeChange={(range) => {
                console.log('[DEBUG] onDateRangeChange callback =>', range);
                setSelectedDateRange(range);
              }}
            />
          </View>

          <Text style={styles.subsubheading}>Timing</Text>
          <TimePicker
            defaultStartTime={activity?.startTime}
            defaultEndTime={activity?.endTime}
            onStartTimeChange={setSelectedStartTime}
            onEndTimeChange={setSelectedEndTime}
          />

          <Text style={styles.subsubheading}>Activity Duration</Text>
          <CategorySelector
            style={styles.textField}
            selectedCategory={duration}
            onSelectCategory={setDuration}
            categories={durationOptions}
          />

          <View style={styles.horizontalLine} />

          {/* Guests */}
          <Text style={styles.subheading}>Guests</Text>
          <Text style={styles.subsubheading}>Guests Per Day</Text>
          <InputFieldHostFormAge
            style={styles.textField}
            placeholder="Maximum no. of guests per day"
            value={maxGuestsPerDay}
            onChangeText={setMaxGuestsPerDay}
          />

          <Text style={styles.subsubheading}>Guests Per Time</Text>
          <InputFieldHostFormAge
            style={styles.textField}
            placeholder="Maximum no. of guests per time"
            value={maxGuestsPerTime}
            onChangeText={setMaxGuestsPerTime}
          />

          <View style={styles.horizontalLine} />

          {/* Price */}
          <Text style={styles.subheading}>Price</Text>
          <Text style={styles.subsubheading}>Price Per Guest</Text>
          <InputFieldHostFormAge
            style={styles.textField}
            placeholder="Price in Rs."
            value={pricePerGuest}
            onChangeText={setPricePerGuest}
          />

          <Text style={styles.subsubheading}>Your Estimated Earning</Text>
          <InputFieldHostFormAge
            style={styles.textField}
            placeholder="Your Estimated Earning will be.."
            value={estimatedEarnings}
            onChangeText={setEstimatedEarnings}
          />

          <View style={styles.horizontalLine} />

          {/* Listing Status */}
          <Text style={styles.subheading}>Your Activity</Text>
          {[
            { id: 1, label: 'List' },
            { id: 2, label: 'Unlist' },
            { id: 3, label: 'Deactivate' },
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.radioContainer}
              onPress={() => setSelectedOption(option.id)}
            >
              <View style={styles.radioCircle}>
                {selectedOption === option.id && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.radioLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <ScheduleCustomButton
            title="Save"
            onPress={handleSave}
            disabled={!formChanged}
            style={!formChanged ? { backgroundColor: '#FFB5B8', borderColor: '#FFB5B8', opacity: 0.9 } : {}}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    width: '112%',
    height: 55,
    paddingHorizontal: 10,
  },
  headerImage: {
    width: 20,
    height: 20,
    marginTop: -1,
    marginLeft: 9,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    flex: 1,
    marginTop: -1,
    marginLeft: -15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
  },
  activityImage: {
    width: 110,
    height: 110,
    borderRadius: 10,
    resizeMode: 'cover',
    marginRight: 15,
  },
  detailRow: {},
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginTop: 3,
    marginBottom: 5,
    marginLeft: 5,
  },
  location: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    marginLeft: 5,
  },
  city: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    marginLeft: 5,
  },
  penny: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    marginLeft: 5,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    width: 14,
    height: 14,
    marginRight: 5,
  },
  horizontalLine: {
    height: 8,
    backgroundColor: "#EAECED",
    width: "120%",
    marginLeft: -20,
    marginTop: 20,
  },
  textField: {
    paddingBottom: 70,
  },
  scheduleContainer: {
    paddingBottom: 20,
  },
  subheading: {
    fontSize: 19,
    fontWeight: '500',
    color: '#000',
    marginBottom: 20,
    marginTop: 25,
  },
  subsubheading: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000',
    marginBottom: 9,
    marginTop: 5,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#000',
  },
  buttonContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 15,
    paddingLeft: 15,
    borderColor: 'white',
    marginTop: -30,
  },
});

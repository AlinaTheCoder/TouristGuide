import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DateRangePicker = ({
  selectedDate: propSelectedDate, // New prop for selected date
  onDateRangeChange,
  label,
  minAllowedDate,
  maxAllowedDate
}) => {
  const [selectedDate, setSelectedDate] = useState(propSelectedDate || null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Sync internal state when prop changes
  useEffect(() => {
    if (propSelectedDate) {
      setSelectedDate(propSelectedDate);
    }
  }, [propSelectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    onDateRangeChange({ selectedDate: date });
    AsyncStorage.setItem('selectedDate', date.toISOString()).catch((e) =>
      console.log("Error saving date:", e)
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const parts = date.toString().split(' ');
    return `${parts[1]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset hours to ensure accurate date comparison
  
  const defaultMaxDate = new Date(today);
  defaultMaxDate.setMonth(today.getMonth() + 1);

  // Parse the minAllowedDate from the activity
  let parsedMinDate = minAllowedDate ? new Date(minAllowedDate) : today;
  parsedMinDate.setHours(0, 0, 0, 0); // Reset hours to ensure accurate date comparison
  
  // If the activity's minimum date is in the past, set the minimum date to today
  if (parsedMinDate < today) {
    parsedMinDate = today;
  }
  
  const parsedMaxDate = maxAllowedDate ? new Date(maxAllowedDate) : defaultMaxDate;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.button, showCalendar && styles.buttonActive]}
        onPress={() => setShowCalendar(!showCalendar)}
      >
        <Text style={styles.buttonText}>
          {selectedDate
            ? `Selected Date: ${formatDate(selectedDate)}`
            : showCalendar
            ? 'Select Date'
            : 'Available Dates'
          }
        </Text>
      </TouchableOpacity>
      {showCalendar && (
        <View style={styles.calendarContainer}>
          <CalendarPicker
            startFromMonday={true}
            allowRangeSelection={false}
            onDateChange={handleDateChange}
            selectedDayColor="grey"
            selectedDayTextColor="#FFFFFF"
            minDate={parsedMinDate}
            maxDate={parsedMaxDate}
            style={styles.calendar}
            previousTitle="<"
            nextTitle=">"
            textStyle={{ color: '#000' }}
          />
        </View>
      )}
    </View>
  );
};

export default DateRangePicker;

const styles = StyleSheet.create({
  container: { marginBottom: 0, marginTop: 8 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  button: {
    height: 50,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginHorizontal: 5,
    marginLeft: -1,
    marginRight: -1,
  },
  buttonActive: { borderColor: '#000000' },
  buttonText: { fontSize: 16, color: '#333', textAlign: 'center' },
  calendarContainer: { marginTop: 10 },
});
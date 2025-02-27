import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';

const DateRangePicker = ({ onDateRangeChange, label, dateRange: preloadedDateRange }) => {
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Preload the date range when the component mounts or preloadedDateRange changes
  useEffect(() => {
    if (preloadedDateRange) {
      setSelectedStartDate(preloadedDateRange.startDate ? new Date(preloadedDateRange.startDate) : null);
      setSelectedEndDate(preloadedDateRange.endDate ? new Date(preloadedDateRange.endDate) : null);
    }
  }, [preloadedDateRange]);

  const handleDateChange = (date, type) => {
    if (type === 'START_DATE') {
      // Update the start date and reset the end date for re-selection
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else if (type === 'END_DATE') {
      if (selectedStartDate && date < selectedStartDate) {
        Alert.alert('Invalid Date', 'End date must be after the start date.');
        return;
      }
      setSelectedEndDate(date);
    }
  };

  const finalizeDateRange = () => {
    if (selectedStartDate && selectedEndDate) {
      onDateRangeChange({ startDate: selectedStartDate, endDate: selectedEndDate });
      setShowCalendar(false);
    }
  };
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return `${date.toDateString()}`;
  };
  const today = new Date();
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.button, showCalendar && styles.buttonActive]}
        onPress={() => setShowCalendar(!showCalendar)}
      >
        <Text style={styles.buttonText}>
          {selectedStartDate && selectedEndDate
            ? `Start: ${formatDate(selectedStartDate)} | End: ${formatDate(selectedEndDate)}`
            : 'Select Dates'}
        </Text>
      </TouchableOpacity>
      {showCalendar && (
        <View style={styles.calendarContainer}>
          <CalendarPicker
            startFromMonday={true}
            allowRangeSelection={true}
            selectedStartDate={selectedStartDate}
            selectedEndDate={selectedEndDate}
            onDateChange={handleDateChange}
            selectedDayColor="grey"
            selectedDayTextColor="#FFFFFF"
            minDate={today}
            previousTitle="<" // Custom text for the previous button
            nextTitle=">"     // Custom text for the next button
            textStyle={{ color: '#000' }} // Ensure text is visible
            todayTextStyle={{ fontWeight: 'bold', color: '#000' }}
          />
          {selectedStartDate && selectedEndDate && (
            <TouchableOpacity style={styles.confirmButton} onPress={finalizeDateRange}>
              <Text style={styles.confirmButtonText}>Confirm Dates</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: { marginBottom: 20 },
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
  },
  buttonActive: {
    borderColor: '#000000',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  calendarContainer: {
    marginTop: 15,
  },
  confirmButton: {
    marginTop: 15,
    height: 50,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});




export default DateRangePicker;




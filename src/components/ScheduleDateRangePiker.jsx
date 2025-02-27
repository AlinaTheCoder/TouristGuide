// components/ScheduleDateRangePicker.js

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';

/**
 * ScheduleDateRangePicker
 *
 * Props:
 * - onDateRangeChange({ startDate, endDate }): callback receiving final dates
 * - dateRange (object): { startDate: string|null, endDate: string|null } for preloading
 * - label (string): optional
 *
 * Behavior:
 * - We do NOT pass selectedStartDate / selectedEndDate => user can pick ANY new start date.
 * - We DO pass 'initialRange' to highlight old preloaded start/end.
 * - Once the user picks the second date (END_DATE), we finalize => onDateRangeChange(...) & close the calendar.
 * - No minDate => user can pick any date in the past or future.
 */

const ScheduleDateRangePicker = ({
  onDateRangeChange,
  label,
  dateRange: preloadedDateRange,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  // We'll store the old start/end just to display on the button
  const [localStartDate, setLocalStartDate] = useState(null);
  const [localEndDate, setLocalEndDate] = useState(null);

  // Load preloadedRange on mount or when it changes
  useEffect(() => {
    if (preloadedDateRange) {
      console.log('[DEBUG - DateRangePicker] Preloading range:', preloadedDateRange);
      setLocalStartDate(preloadedDateRange.startDate || null);
      setLocalEndDate(preloadedDateRange.endDate || null);
    }
  }, [preloadedDateRange]);

  // Convert string => Date obj for "initialRange"
  const parseDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const oldStartObj = parseDate(localStartDate);
  const oldEndObj = parseDate(localEndDate);

  // If both valid, pass them to 'initialRange'
  const initialRange =
    oldStartObj && oldEndObj ? [oldStartObj, oldEndObj] : undefined;

  // Called on each date tap
  const handleDateChange = (date, type) => {
    console.log('[DEBUG - DateRangePicker] handleDateChange =>', date?.toString(), 'type:', type);

    if (type === 'START_DATE') {
      // First tap
      setLocalStartDate(date.toISOString());
      setLocalEndDate(null);
    } else if (type === 'END_DATE') {
      // Second tap => finalize
      const newRange = {
        // If user picks start date first, we stored it
        startDate: localStartDate || date.toISOString(),
        endDate: date.toISOString(),
      };
      console.log('[DEBUG - DateRangePicker] Final range selected =>', newRange);

      setLocalEndDate(date.toISOString());
      onDateRangeChange && onDateRangeChange(newRange);

      // Close calendar automatically
      setShowCalendar(false);
    }
  };

  // Button text
  const formatButtonText = () => {
    if (localStartDate && localEndDate) {
      const startStr = new Date(localStartDate).toDateString();
      const endStr = new Date(localEndDate).toDateString();
      return `Start: ${startStr} | End: ${endStr}`;
    }
    return 'Select Dates';
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.button, showCalendar && styles.buttonActive]}
        onPress={() => {
          console.log('[DEBUG - DateRangePicker] Toggling calendar. Currently:', !showCalendar);
          setShowCalendar(!showCalendar);
        }}
      >
        <Text style={styles.buttonText}>{formatButtonText()}</Text>
      </TouchableOpacity>

      {showCalendar && (
        <View style={styles.calendarContainer}>
          <CalendarPicker
            startFromMonday
            allowRangeSelection
            onDateChange={handleDateChange}
            initialRange={initialRange}
            selectedDayColor="grey"
            selectedDayTextColor="#FFFFFF"
            previousTitle="<"
            nextTitle=">"
            textStyle={{ color: '#000' }}
            todayTextStyle={{ fontWeight: 'bold', color: '#000' }}
          />
        </View>
      )}
    </View>
  );
};

export default ScheduleDateRangePicker;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
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
});

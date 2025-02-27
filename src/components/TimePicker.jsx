import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const TimePicker = ({ label, startTime: preloadedStartTime, endTime: preloadedEndTime, onStartTimeChange, onEndTimeChange }) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startTime, setStartTime] = useState(preloadedStartTime || null);
  const [endTime, setEndTime] = useState(preloadedEndTime || null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (preloadedStartTime) setStartTime(new Date(preloadedStartTime));
    if (preloadedEndTime) setEndTime(new Date(preloadedEndTime));
  }, [preloadedStartTime, preloadedEndTime]);

  const handleStartTimeChange = (event, selected) => {
    setShowStartPicker(false);
    if (selected) {
      if (endTime && selected >= endTime) {
        setErrorMessage('Start time must be earlier than end time.');
      } else {
        setStartTime(selected);
        setErrorMessage('');
        onStartTimeChange(selected); // Notify parent of the start time change
      }
    }
  };

  const handleEndTimeChange = (event, selected) => {
    setShowEndPicker(false);
    if (selected) {
      if (startTime && selected <= startTime) {
        setErrorMessage('End time must be later than start time.');
      } else {
        setEndTime(selected);
        setErrorMessage('');
        onEndTimeChange(selected); // Notify parent of the end time change
      }
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={() => setShowStartPicker(true)}>
          <Text style={styles.buttonText}>
            {startTime ? `Start: ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Start Time'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setShowEndPicker(true)}>
          <Text style={styles.buttonText}>
            {endTime ? `End: ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'End Time'}
          </Text>
        </TouchableOpacity>
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {showStartPicker && (
        <DateTimePicker
          value={startTime || new Date()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleStartTimeChange}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endTime || new Date()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleEndTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
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
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default TimePicker;


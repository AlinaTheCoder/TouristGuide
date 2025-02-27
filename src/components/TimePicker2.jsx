import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const TimePicker = ({
  label,
  defaultStartTime,
  defaultEndTime,
  onStartTimeChange,
  onEndTimeChange,
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Preload
  useEffect(() => {
    if (defaultStartTime) {
      const parsed = new Date(defaultStartTime);
      if (!isNaN(parsed)) setStartTime(parsed);
    }
    if (defaultEndTime) {
      const parsed = new Date(defaultEndTime);
      if (!isNaN(parsed)) setEndTime(parsed);
    }
  }, [defaultStartTime, defaultEndTime]);

  const handleStartTimeChange = (event, selected) => {
    setShowStartPicker(false);
    if (selected) {
      if (endTime && selected >= endTime) {
        setErrorMessage('Start time must be earlier than end time.');
      } else {
        setStartTime(selected);
        setErrorMessage('');
        onStartTimeChange && onStartTimeChange(selected);
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
        onEndTimeChange && onEndTimeChange(selected);
      }
    }
  };

  const formatTime = (dateObj) => {
    if (!dateObj) return null;
    return dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={() => setShowStartPicker(true)}>
          <Text style={styles.buttonText}>
            {startTime ? `Start: ${formatTime(startTime)}` : 'Start Time'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => setShowEndPicker(true)}>
          <Text style={styles.buttonText}>
            {endTime ? `End: ${formatTime(endTime)}` : 'End Time'}
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
    marginLeft: -4,
    marginRight: -4,
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
  buttonText: { fontSize: 16, color: '#333' },
  error: { color: 'red', fontSize: 14, marginTop: 10, textAlign: 'center' },
});

export default TimePicker;

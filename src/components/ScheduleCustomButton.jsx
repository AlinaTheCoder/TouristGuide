// components/ScheduleCustomButton.js

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const ScheduleCustomButton = ({ title, onPress, disabled, style }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.disabledButton, style]}
    >
      <Text style={[styles.buttonText, disabled && styles.disabledButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '110%',
    height: 50,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FF5A5F',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: '#FF5A5F',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#FFB5B8',
    borderColor: '#FFB5B8',
    opacity: 0.9,
  },
  disabledButtonText: {
    color: '#fff',
  },
});

export default ScheduleCustomButton;

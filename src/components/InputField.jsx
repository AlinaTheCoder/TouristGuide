// src/components/InputField.jsx
import React, { useState } from 'react';
import { TextInput, StyleSheet, View } from 'react-native';

const InputField = ({ placeholder, value, onChangeText, secureTextEntry, keyboardType }) => {
  const [isFocused, setIsFocused] = useState(false); // State to track focus

  return (
    <View style={[styles.container, isFocused && styles.focusedContainer]}>
      <TextInput
        style={[styles.input, isFocused && styles.focusedInput]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        placeholderTextColor="#aaa"
        selectionColor="#000000"
        onFocus={() => setIsFocused(true)} // Change state to true on focus
        onBlur={() => setIsFocused(false)} // Change state to false on blur
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '82%',
    marginVertical: 6,
  },
  input: {
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 5,
    color:'black'
  },
  focusedInput: {
    borderColor: '#000000', // Change border color to black on focus
  },
});

export default InputField;

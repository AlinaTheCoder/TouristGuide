// src/components/InputFieldHostForm.jsx
import React, { useState } from 'react';
import { TextInput, StyleSheet, View } from 'react-native';


const InputFieldHostForm = ({ placeholder, value, onChangeText, secureTextEntry, multiline, numberOfLines }) => {
  const [isFocused, setIsFocused] = useState(false); // Track if the input is focused


  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, isFocused && styles.focusedInput]} // Apply focused style if input is focused
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor="#aaa"
        selectionColor="lightgrey"
        onFocus={() => setIsFocused(true)} // Set focus when input is clicked
        onBlur={() => setIsFocused(false)} // Remove focus when input loses focus
        color="#000000"
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  input: {
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc', // Default border color
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  focusedInput: {
    borderColor: '#000000', // Change border color to red when focused
  },
});


export default InputFieldHostForm;




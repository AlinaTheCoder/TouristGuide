import React, { useState } from 'react';
import { TextInput, StyleSheet, View } from 'react-native';

const InputFieldHostFormAge = ({ placeholder, value, onChangeText, maxLength }) => {
  const [isFocused, setIsFocused] = useState(false); // Track if the input is focused

  // Function to allow only numeric input
  const handleTextChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    onChangeText(numericValue);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, isFocused && styles.focusedInput]} // Apply focused style if input is focused
        placeholder={placeholder}
        value={value}
        onChangeText={handleTextChange} // Restrict input to numbers
        keyboardType="numeric" // Numeric keyboard
        maxLength={maxLength} // Limit the number of characters (optional)
        placeholderTextColor="#aaa"
        selectionColor="#000000"
        onFocus={() => setIsFocused(true)} // Set focus when input is clicked
        onBlur={() => setIsFocused(false)} // Remove focus when input loses focus
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
    borderColor: '#000000', // Change border color to black when focused
  },
});

export default InputFieldHostFormAge;

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const DescriptionInputFieldOptional = ({
  value,
  onChangeText,
  wordCount,
  onDescriptionChange = () => {}, // Default to no-op function if not passed
  placeholder,
}) => {
  const [isFocused, setIsFocused] = useState(false); // Track focus state

  // On text change, update the word count and the value
  const handleTextChange = (text) => {
    onChangeText(text);
    onDescriptionChange(text); // Safely call onDescriptionChange to update word count
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.textInput, isFocused && styles.focusedInput]} // Apply focused style if input is focused
        placeholder={placeholder} // Accept placeholder as a prop
        placeholderTextColor="#aaa"
        selectionColor="#000000"
        value={value}
        onChangeText={handleTextChange} // Handle text change
        multiline={true}
        numberOfLines={6} // Adjust height of the input field
        onFocus={() => setIsFocused(true)} // Set focus state on input field focus
        onBlur={() => setIsFocused(false)} // Remove focus when input loses focus
      />
      <View style={styles.wordCountContainer}>
        {/* Show the error only if the word count exceeds 150 */}
        {wordCount > 150 && (
          <Text style={styles.errorText}>Cannot exceed 150 words.</Text>
        )}
        {/* Always display the word count on the right side */}
        <Text style={styles.wordCount}>
          {wordCount} / 150 words
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10, // Adds space between input fields
  },
  textInput: {
    height: 160, // More height for the description input field
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top', // Aligns text to the top for multiline
  },
  focusedInput: {
    borderColor: '#000000', // Change border color when focused
  },
  wordCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Ensures error text and word count are on opposite sides
    alignItems: 'center', // Vertically align content
    marginTop: 2,
  },
  wordCount: {
    fontSize: 14,
    color: '#aaa',
  },
  errorText: {
    fontSize: 14,
    color: '#FF5A5F',
  },
});

export default DescriptionInputFieldOptional;

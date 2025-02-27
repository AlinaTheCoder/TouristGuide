import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';


const DescriptionInputField = ({
  value = '', // Default value if not provided
  onChangeText = () => {}, // Default no-op function if not provided
  wordCount = 0, // Default to 0 if not provided
  onDescriptionChange = () => {}, // Default no-op function if not provided
  placeholder = 'Enter description here', // Default placeholder if not provided
}) => {
  const [isFocused, setIsFocused] = useState(false); // Track focus state
  const [isTouched, setIsTouched] = useState(false); // Track if the input has been touched


  useEffect(() => {
    if (isFocused) {
      setIsTouched(true); // Mark as touched when focused
    }
  }, [isFocused]);


  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.textInput, isFocused && styles.focusedInput]} // Apply focused style if input is focused
        placeholder={placeholder} // Accept placeholder as a prop
        placeholderTextColor="#aaa"
        selectionColor="lightgrey"
        value={value}
        onChangeText={(text) => {
          onChangeText?.(text); // Safely call if defined
          onDescriptionChange?.(text); // Update word count as well
        }}
        multiline={true}
        numberOfLines={6} // Adjust height of the input field
        onFocus={() => setIsFocused(true)} // Set focus state on input field focus
        onBlur={() => setIsFocused(false)} // Remove focus when input loses focus
        color="#000000"
      />
      <View style={styles.wordCountContainer}>
        {/* Show the error only if the input has been touched and word count is below 50 */}
        {isTouched && wordCount < 50 && (
          <Text style={styles.errorText}>Contain at least 50 words.</Text>
        )}
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


export default DescriptionInputField;




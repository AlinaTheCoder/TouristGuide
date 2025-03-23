import React, { useState } from 'react';
import { TextInput, StyleSheet, View, TouchableOpacity, Image } from 'react-native';


const PasswordField = ({ placeholder, value, onChangeText, secureTextEntry: initialSecureTextEntry, keyboardType }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(initialSecureTextEntry);


  const togglePasswordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };


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
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <TouchableOpacity
        style={styles.eyeIconContainer}
        onPress={togglePasswordVisibility}
      >
        <Image
          source={
            secureTextEntry
              ? require('../icons/eye-closed.png')
              : require('../icons/eye-open.png')
          }
          style={styles.eyeIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
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
    paddingRight: 50, // Make space for the eye icon
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 5,
    color: 'black',
  },
  focusedInput: {
    borderColor: '#000000', // Change border color to black on focus
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 13,
    top: '50%',
    transform: [{ translateY: -12 }], // Center vertically
  },
  eyeIcon: {
    width: 24,
    height: 24,
    tintColor: '#666',
  },
});


export default PasswordField;


import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, StyleSheet, Image, Platform } from 'react-native';

const CategorySelector = ({ selectedCategory, onSelectCategory, categories }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleValueChange = (itemValue) => {
    const selectedItem = categories.find((cat) => cat.value === itemValue);
    setSelectedLabel(selectedItem ? selectedItem.label : "");
    onSelectCategory(itemValue);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.pickerWrapper,
          isFocused && styles.focusedPickerWrapper,
        ]}
      >
        {/* For Android, hide the default dropdown icon */}
        <Picker
          selectedValue={selectedCategory}
          onValueChange={handleValueChange}
          style={styles.picker}
          onBlur={handleBlur}
          dropdownIconColor="transparent" // This hides the default arrow on Android
        >
          <Picker.Item
            value=""
            label="Select Time Slot"
            color="#aaa"
          />
          {categories.map((category, index) => (
            <Picker.Item
              key={index}
              label={category.label}
              value={category.value}
            />
          ))}
        </Picker>
        
        {/* Custom dropdown arrow */}
        <View style={styles.dropdownIconContainer}>
          <Image 
            source={require('../icons/dropdown-arrow.png')} 
            style={styles.dropdownIcon}
          />
        </View>
      </View>
    </View>
  );
};

export default CategorySelector;


const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 8,
    marginBottom: 20,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative', // For positioning the custom dropdown icon
  },
  focusedPickerWrapper: {
    borderColor: '#000000',
  },
  picker: {
    height: 50,
    color: '#000000',
    // On iOS, we need to add padding-right to avoid text overlapping with our custom icon
    ...(Platform.OS === 'ios' ? { paddingRight: 30 } : {}),
  },
  dropdownIconContainer: {
    position: 'absolute',
    right: 19,
    top: -2,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none', // Makes sure the icon doesn't interfere with picker touches
  },
  dropdownIcon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
  },
});
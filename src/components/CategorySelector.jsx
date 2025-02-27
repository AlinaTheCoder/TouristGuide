import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, StyleSheet } from 'react-native';

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
        <Picker
          selectedValue={selectedCategory}
          onValueChange={handleValueChange}
          style={styles.picker}
          onBlur={handleBlur}
        >
          <Picker.Item
            value=""
            label="Select Option"
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
      </View>
    </View>
  );
};

export default CategorySelector;

/* No styling changed */
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
  },
  focusedPickerWrapper: {
    borderColor: '#000000',
  },
  picker: {
    height: 50,
    color: '#000000',
  },
});

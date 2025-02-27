import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";

const WhoModel = ({ visible, onClose, initialData, onSave, resetTrigger }) => {
  const [selectedCategory, setSelectedCategory] = useState(initialData.category || "");
  const [value, setValue] = useState(initialData.value || 0);

  const ageGroups = [
    { label: 'Children (1-12)', value: 'Children' },
    { label: 'Teenagers (13-19)', value: 'Teenagers' },
    { label: 'Adults (20+)', value: 'Adults' },
    { label: 'Children and Teenagers (1-19)', value: 'Children and Teenagers' },
    { label: 'Teenagers and Adults (13-20+)', value: 'Teenagers and Adults' },
    { label: 'All Ages (1+)', value: 'All Ages (1+)' },
  ];

  useEffect(() => {
    setSelectedCategory("");
    setValue(0);
  }, [resetTrigger]);

  const handleSelection = (newValue) => {
    setSelectedCategory(newValue);
    if (selectedCategory !== newValue) setValue(1);
  };

  const increment = () => setValue(prev => prev + 1);
  const decrement = () => setValue(prev => (prev > 0 ? prev - 1 : 0));

  const handleClose = () => {
    if (!selectedCategory) {
      setSelectedCategory('');
      setValue(0);
    }
    onSave({ category: selectedCategory, value });
    onClose();
  };

  const renderRow = (label, catValue) => {
    const isSelected = selectedCategory === catValue;
    return (
      <TouchableOpacity
        key={catValue}
        style={[styles.optionRow, isSelected && styles.selectedRow]}
        onPress={() => handleSelection(catValue)}
        activeOpacity={0.8}
      >
        <View style={styles.optionDetails}>
          <Text style={[styles.optionTitle, isSelected && styles.selectedTitle]}>
            {label}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.counter}>
            <TouchableOpacity
              style={[styles.counterButton, value === 0 && styles.disabledButton]}
              onPress={decrement}
              disabled={value === 0}
            >
              <Text style={styles.counterText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{value}</Text>
            <TouchableOpacity style={styles.counterButton} onPress={increment}>
              <Text style={styles.counterText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <View style={styles.crossIconWrapper}>
                  <View style={[styles.line, styles.diagonalLeft]} />
                  <View style={[styles.line, styles.diagonalRight]} />
                </View>
              </TouchableOpacity>
              <Text style={styles.title}>Who's Coming?</Text>
              {ageGroups.map(({ label, value }) => renderRow(label, value))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default WhoModel;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  crossIconWrapper: {
    width: 35,
    height: 35,
    borderRadius: 25,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "grey",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 2 },
    marginTop: 2,
  },
  line: {
    position: "absolute",
    width: 13,
    height: 2,
    backgroundColor: "black",
  },
  diagonalLeft: {
    transform: [{ rotate: "45deg" }],
  },
  diagonalRight: {
    transform: [{ rotate: "-45deg" }],
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    marginTop: 24,
    alignSelf: 'center',
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 15,
    width: "100%",
  },
  selectedRow: {
    borderColor: "#333333",
    backgroundColor: "#F5F5F5",
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
  },
  selectedTitle: {
    color: "#333333",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
  },
  counterButton: {
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 50,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    borderColor: "#ddd",
  },
  counterText: {
    fontSize: 20,
    color: "#333333",
  },
  counterValue: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 10,
  },
});

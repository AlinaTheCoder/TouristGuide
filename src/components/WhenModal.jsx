import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';

const { width, height } = Dimensions.get('window');

const WhenModal = ({ isVisible, onClose, onDateRangeChange, resetTrigger }) => {
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const today = new Date();

  useEffect(() => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  }, [resetTrigger]);

  const handleDateChange = (date) => {
    if (!selectedStartDate) {
      setSelectedStartDate(date);
    } else if (!selectedEndDate) {
      setSelectedEndDate(date);
    } else {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    }
  };

  const handleClose = () => {
    onDateRangeChange({
      startDate: selectedStartDate,
      endDate: selectedEndDate || null,
    });
    onClose();
  };

  const formatDate = (date) => {
    if (!date) return '';
    return `${date.toString().split(' ')[1]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const customDatesStyles = [];
  if (selectedStartDate && !selectedEndDate) {
    customDatesStyles.push({
      date: selectedStartDate,
      style: styles.singleDayStyle,
      textStyle: { color: '#fff' },
    });
  }

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.crossButton} onPress={handleClose}>
                <View style={styles.crossIconWrapper}>
                  <View style={[styles.line, styles.diagonalLeft]} />
                  <View style={[styles.line, styles.diagonalRight]} />
                </View>
              </TouchableOpacity>
              <Text style={styles.heading}>When's your Trip?</Text>
              <Text style={styles.selectedDatesText}>
                {selectedStartDate
                  ? selectedEndDate
                    ? `Selected: ${formatDate(selectedStartDate)} - ${formatDate(selectedEndDate)}`
                    : `Selected: ${formatDate(selectedStartDate)}`
                  : 'Any week'}
              </Text>
              <View style={styles.calendarContainer}>
                <CalendarPicker
                  startFromMonday
                  allowRangeSelection
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  onDateChange={handleDateChange}
                  minDate={today}
                  selectedDayTextColor="#FFFFFF"
                  selectedRangeStartStyle={styles.rangeStartStyle}
                  selectedRangeEndStyle={styles.rangeEndStyle}
                  selectedRangeStyle={styles.rangeStyle}
                  customDatesStyles={customDatesStyles}
                  style={styles.calendar}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default WhenModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.97,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    maxHeight: height * 0.8,
  },
  crossButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  crossIconWrapper: {
    width: 35,
    height: 35,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: 'grey',
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#dfdfdf',
    marginTop: 2,
  },
  line: {
    position: 'absolute',
    width: 13,
    height: 2,
    backgroundColor: 'black',
  },
  diagonalLeft: {
    transform: [{ rotate: '45deg' }],
  },
  diagonalRight: {
    transform: [{ rotate: '-45deg' }],
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 24,
    alignSelf: 'flex-start',
  },
  selectedDatesText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
  },
  calendarContainer: {
    marginTop: 10,
    width: '100%',
    height: 300,
  },
  calendar: {
    height: 250,
  },
  // Updated selection styles to use grey color
  singleDayStyle: {
    backgroundColor: 'grey',
    borderRadius: 50,
  },
  rangeStartStyle: {
    backgroundColor: 'grey',
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
  },
  rangeEndStyle: {
    backgroundColor: 'grey',
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  },
  rangeStyle: {
    backgroundColor: 'grey',
  },
});

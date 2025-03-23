import React, { useState, useEffect } from 'react';  
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';  
import CalendarPicker from 'react-native-calendar-picker';  
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from "../config/apiConfig";

const DateRangePicker = ({  
  selectedDate: propSelectedDate, // Prop for selected date  
  onDateRangeChange,  
  label,  
  minAllowedDate,  
  maxAllowedDate,
  activityId // New prop for activity ID  
}) => {  
  const [selectedDate, setSelectedDate] = useState(propSelectedDate || null);  
  const [showCalendar, setShowCalendar] = useState(false);
  const [customMinDate, setCustomMinDate] = useState(null);
  const [checkingTodaySlots, setCheckingTodaySlots] = useState(false);

  // Sync internal state when prop changes  
  useEffect(() => {  
    if (propSelectedDate) {  
      setSelectedDate(propSelectedDate);  
    }  
  }, [propSelectedDate]);

  // Check if today has available slots
  useEffect(() => {
    const checkTodaySlots = async () => {
      if (!activityId) return;
      
      try {
        setCheckingTodaySlots(true);
        
        const today = new Date();
        const dateString = formatDateForAPI(today);
        
        const response = await apiInstance.get(
          `/getTimeSlots/${activityId}?date=${dateString}`
        );
        
        if (response.data.success) {
          const { timeSlots, dayFullyBooked } = response.data.data;
          
          // If today has no available slots (all in past or fully booked)
          if (timeSlots.length === 0 || dayFullyBooked) {
            // Set minimum date to tomorrow instead of today
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            setCustomMinDate(tomorrow);
            
            // If user had selected today, clear the selection
            if (selectedDate && isSameDay(selectedDate, today)) {
              setSelectedDate(null);
              onDateRangeChange({ selectedDate: null });
              AsyncStorage.removeItem('selectedDate').catch((e) =>
                console.log("Error removing date:", e)
              );
            }
          } else {
            // Today has available slots, use the original minAllowedDate
            resetMinDate();
          }
        } else {
          // On error, default to original minAllowedDate
          resetMinDate();
        }
      } catch (err) {
        console.error("Error checking today's slots:", err);
        // On error, default to original minAllowedDate
        resetMinDate();
      } finally {
        setCheckingTodaySlots(false);
      }
    };
    
    checkTodaySlots();
  }, [activityId]);

  const resetMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse the minAllowedDate from the activity  
    let parsedMinDate = minAllowedDate ? new Date(minAllowedDate) : today;  
    parsedMinDate.setHours(0, 0, 0, 0);
    
    // If the activity's minimum date is in the past, set the minimum date to today  
    if (parsedMinDate < today) {  
      parsedMinDate = today;  
    }
    
    setCustomMinDate(parsedMinDate);
  };

  const formatDateForAPI = (date) => {  
    const year = date.getFullYear();  
    const month = String(date.getMonth() + 1).padStart(2, "0");  
    const day = String(date.getDate()).padStart(2, "0");  
    return `${year}-${month}-${day}`;  
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const handleDateChange = (date) => {  
    setSelectedDate(date);  
    onDateRangeChange({ selectedDate: date });  
    AsyncStorage.setItem('selectedDate', date.toISOString()).catch((e) =>  
      console.log("Error saving date:", e)  
    );  
  };

  const formatDate = (date) => {  
    if (!date) return 'N/A';  
    const parts = date.toString().split(' ');  
    return `${parts[1]} ${date.getDate()}, ${date.getFullYear()}`;  
  };

  const today = new Date();  
  today.setHours(0, 0, 0, 0); // Reset hours to ensure accurate date comparison  
   
  const defaultMaxDate = new Date(today);  
  defaultMaxDate.setMonth(today.getMonth() + 1);

  // Use customMinDate if available, otherwise calculate based on original props
  const effectiveMinDate = customMinDate || (() => {
    // Parse the minAllowedDate from the activity  
    let parsedMinDate = minAllowedDate ? new Date(minAllowedDate) : today;  
    parsedMinDate.setHours(0, 0, 0, 0);
    
    // If the activity's minimum date is in the past, set the minimum date to today  
    if (parsedMinDate < today) {  
      return today;  
    }
    return parsedMinDate;
  })();
   
  const parsedMaxDate = maxAllowedDate ? new Date(maxAllowedDate) : defaultMaxDate;

  return (  
    <View style={styles.container}>  
      {label && <Text style={styles.label}>{label}</Text>}  
      <TouchableOpacity  
        style={[styles.button, showCalendar && styles.buttonActive]}  
        onPress={() => setShowCalendar(!showCalendar)}  
        disabled={checkingTodaySlots}
      >  
        {checkingTodaySlots ? (
          <ActivityIndicator size="small" color="#FF5A5F" />
        ) : (
          <Text style={styles.buttonText}>  
            {selectedDate  
              ? `Selected Date: ${formatDate(selectedDate)}`  
              : showCalendar  
              ? 'Select Date'  
              : 'Available Dates'  
            }  
          </Text>
        )}  
      </TouchableOpacity>  
      {showCalendar && (  
        <View style={styles.calendarContainer}>  
          <CalendarPicker  
            startFromMonday={true}  
            allowRangeSelection={false}  
            onDateChange={handleDateChange}  
            selectedDayColor="grey"  
            selectedDayTextColor="#FFFFFF"  
            minDate={effectiveMinDate}  
            maxDate={parsedMaxDate}  
            style={styles.calendar}  
            previousTitle="<"  
            nextTitle=">"  
            textStyle={{ color: '#000' }}  
            disabledDates={date => {
              // Additional custom disabled dates logic can be added here if needed
              return false;
            }}
          />  
        </View>  
      )}  
    </View>  
  );  
};

export default DateRangePicker;

const styles = StyleSheet.create({  
  container: { marginBottom: 0, marginTop: 8 },  
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },  
  button: {  
    height: 50,  
    paddingHorizontal: 15,  
    justifyContent: 'center',  
    alignItems: 'center',  
    borderWidth: 1,  
    borderColor: '#ccc',  
    backgroundColor: '#fff',  
    borderRadius: 5,  
    marginHorizontal: 5,  
    marginLeft: -1,  
    marginRight: -1,  
  },  
  buttonActive: { borderColor: '#000000' },  
  buttonText: { fontSize: 16, color: '#333', textAlign: 'center' },  
  calendarContainer: { marginTop: 10 },  
});
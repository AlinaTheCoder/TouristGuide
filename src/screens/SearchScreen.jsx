// SearchScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import searchIcon from '../icons/mySearch.png';
import WhenModal from '../components/WhenModal';
import WhoModel from '../components/WhoModel';
import CategorySelector1 from '../components/CategorySelector1';
import apiInstance from '../config/apiConfig'; // Use API instance instead of direct Firebase access

const { width } = Dimensions.get('window');

function SearchScreen() {
  const navigation = useNavigation();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('1'); // '1' means "I'm flexible"
  const [isWhenModalVisible, setIsWhenModalVisible] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('Any week');
  const [rawDateRange, setRawDateRange] = useState(null); // Store raw date range { startDate, endDate }
  const [searchQuery, setSearchQuery] = useState('');
  const [isWhoModalVisible, setIsWhoModalVisible] = useState(false);
  const [guestDetails, setGuestDetails] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [city, setCity] = useState('');
  const [cityCategories, setCityCategories] = useState([]);

  // Reset searchQuery whenever the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setSearchQuery('');
    }, [])
  );

  // Fetch cities from the API endpoint instead of directly from Firebase
  useEffect(() => {
    const fetchCities = async () => {
      try {
        // Use the correct path to get cities
        const response = await apiInstance.get('/search/cities');
        
        if (response.data && response.data.cities) {
          setCityCategories(response.data.cities);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    fetchCities();
  }, []);

  // Listen for keyboard show/hide events
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () =>
      setIsKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () =>
      setIsKeyboardVisible(false)
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const regions = [
    { id: '1', name: "I'm flexible", image: require('../images/Pakistan_map.png') },
    { id: '2', name: 'Punjab', image: require('../images/Punjab_map.png') },
    { id: '3', name: 'Sindh', image: require('../images/Sindh_map.png') },
    { id: '4', name: 'KPK', image: require('../images/KPK.png') },
    { id: '5', name: 'Balochistan', image: require('../images/Balochistan.png') },
  ];

  // When the user selects a date range from WhenModal,
  // update both the formatted string and the raw date range (ISO strings)
  const handleDateRangeChange = ({ startDate, endDate }) => {
    if (startDate) {
      const formatted = endDate
        ? `${startDate.toString().split(' ')[1]} ${startDate.getDate()} - ${endDate.toString().split(' ')[1]} ${endDate.getDate()}`
        : `${startDate.toString().split(' ')[1]} ${startDate.getDate()}`;
      setSelectedDateRange(formatted);
      setRawDateRange({ startDate: startDate.toISOString(), endDate: endDate ? endDate.toISOString() : null });
    } else {
      setSelectedDateRange('Any week');
      setRawDateRange(null);
    }
  };

  const handleSearch = () => {
    // Navigate to AfterSearch screen with search parameters
    navigation.navigate('AfterSearch', {
      searchQuery,
      selectedRegion,
      selectedDateRange,
      rawDateRange, // pass raw date range for backend filtering
      guestDetails: guestDetails || { category: "", value: 0 },
      city, // Pass the selected city to the search
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.crossButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.crossIconWrapper}>
              <View style={[styles.line, styles.diagonalLeft]} />
              <View style={[styles.line, styles.diagonalRight]} />
            </View>
          </TouchableOpacity>

          <View style={styles.groupContainer}>
            <Text style={styles.heading}>Where To?</Text>

            {/* City dropdown selector */}
            <CategorySelector1
              selectedCategory={city}
              onSelectCategory={setCity}
              categories={cityCategories}
            />

            <FlatList
              data={regions}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
              renderItem={({ item }) => (
                <View style={styles.imageBlockContainer}>
                  <TouchableOpacity
                    style={[
                      styles.imageBlock,
                      { borderColor: selectedRegion === item.id ? 'black' : 'lightgrey' },
                    ]}
                    onPress={() => setSelectedRegion(item.id)}
                  >
                    <Image source={item.image} style={styles.image} />
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.imageText,
                      { color: selectedRegion === item.id ? 'black' : 'grey' },
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>
              )}
            />
          </View>

          <TouchableOpacity
            style={styles.option}
            onPress={() => setIsWhenModalVisible(true)}
          >
            <Text style={styles.optionText}>When</Text>
            <Text style={styles.optionDetail}>
              {selectedDateRange && selectedDateRange !== 'Any week'
                ? selectedDateRange
                : 'Any week'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => setIsWhoModalVisible(true)}
          >
            <Text style={styles.optionText}>Who</Text>
            <Text style={styles.optionDetail}>
              {guestDetails?.category
                ? `${guestDetails.value} ${guestDetails.category}`
                : "Add guests"}
            </Text>
          </TouchableOpacity>

          {!isKeyboardVisible && (
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedRegion('1');
                  setSelectedDateRange('Any week');
                  setRawDateRange(null);
                  setGuestDetails(null);
                  setCity(''); // Reset city selection
                  // Increment the reset trigger to signal the modals to reset
                  setResetTrigger(prev => prev + 1);
                }}
              >
                <Text style={styles.clearButtonText}>Clear all</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
              >
                <Image
                  source={require('../icons/search.png')}
                  style={styles.searchButtonIcon}
                />
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
          )}

          <WhenModal
            isVisible={isWhenModalVisible}
            onClose={() => setIsWhenModalVisible(false)}
            onDateRangeChange={handleDateRangeChange}
            resetTrigger={resetTrigger}
          />

          <WhoModel
            visible={isWhoModalVisible}
            onClose={() => setIsWhoModalVisible(false)}
            initialData={guestDetails || { category: "", value: 0 }}
            onSave={(data) => setGuestDetails(data)}
            resetTrigger={resetTrigger}    
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    flexGrow: 1,
    padding: 15,
    backgroundColor: '#f7f7f7',
  },
  crossButton: {
    position: 'absolute',
    top: 20,
    left: 15,
    zIndex: 1,
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
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#ffffff',
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
  groupContainer: {
    elevation: 5,
    marginTop: 60,
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffffff',
    paddingBottom: 0,
  },
  heading: {
    fontSize: 28,
    color: 'black',
    fontWeight: '500',
    marginBottom: 20,
    letterSpacing: 1,
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d7d7d7',
    height: 60,
  },
  searchInput: {
    fontSize: 16,
    color: 'black',
    letterSpacing: 0.5,
  },
  searchIcon: {
    width: 15,
    height: 15,
    marginRight: 10,
  },
  horizontalScroll: {
    marginBottom: 20,
    paddingRight: 15,
  },
  imageBlockContainer: {
    alignItems: 'flex-start',
    marginRight: 15,
    paddingBottom: 5,
  },
  imageText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginBottom: 0,
  },
  imageBlock: {
    padding: 10,
    borderWidth: 2,
    borderColor: 'lightgrey',
    borderRadius: 25,
    backgroundColor: '#FFF',
  },
  image: {
    width: width * 0.3,
    height: width * 0.3,
    resizeMode: 'contain',
  },
  option: {
    elevation: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    height: 60,
  },
  optionText: {
    fontSize: 18,
    color: 'black',
    fontWeight: '600',
  },
  optionDetail: {
    fontSize: 16,
    color: 'grey',
    fontWeight: '450',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: '#dfdfdf',
    elevation: 5,
    height: 80,
  },
  searchButton: {
    backgroundColor: '#ff5a60',
    borderRadius: 7,
    paddingVertical: 13,
    paddingHorizontal: 27,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  searchButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '400',
  },
  searchButtonIcon: {
    width: 15,
    height: 15,
    marginRight: 7,
    paddingLeft: 1,
    tintColor: 'white',
  },
  clearButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  clearButtonText: {
    fontSize: 18,
    fontWeight: '600',
    textDecorationLine: 'underline',
    color: 'black',
  },
});

export default SearchScreen;
// AfterSearch.js
import React, { useEffect, useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,           
} from 'react-native';
import TopSection from '../components/TopSection2';
import { useNavigation, useRoute } from '@react-navigation/native';
import apiInstance from '../config/apiConfig';
import { WishlistContext } from '../contexts/WishlistContext';

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemMargin = 10;
const itemWidth = (width - (numColumns + 1) * itemMargin * 2) / numColumns;

const AfterSearch = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { searchQuery, selectedRegion, selectedDateRange, rawDateRange, guestDetails } = route.params;

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const { wishlistIds, toggleWishlist, loadWishlist } = useContext(WishlistContext);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        console.log('[AfterSearch] Fetching activities with params:', {
          searchQuery,
          selectedRegion,
          rawDateRange,
          guestDetails,
        });
        const response = await apiInstance.post('/search', {
          searchQuery,
          selectedRegion,
          rawDateRange,
          guestDetails,
        });

        if (response.data && response.data.activities) {
          console.log(`[AfterSearch] Received ${response.data.activities.length} activities.`);
          setActivities(response.data.activities);
        } else {
          console.warn('[AfterSearch] No activities returned from search.');
        }
      } catch (error) {
        console.error('[AfterSearch] Error fetching activities:', error);

        // --- Network vs. Server Error Handling ---
        if (!error.response) {
          // No response at all => likely network error
          Alert.alert(
            'Network Error',
            'Unable to reach the server. Please check your internet connection and try again.'
          );
        } else {
          // Server responded with an error (4xx, 5xx, etc.)
          Alert.alert(
            'Error',
            error.response.data?.error ||
              error.response.data?.message ||
              error.message ||
              'Something went wrong while searching. Please try again.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    loadWishlist();
  }, [searchQuery, selectedRegion, rawDateRange, guestDetails, loadWishlist]);

  const isActivityLiked = (activityId) => !!wishlistIds[activityId];

  const handleToggleLike = (activityId) => {
    toggleWishlist(activityId);
  };

  const renderItem = ({ item }) => {
    const activityImage =
      item.activityImages && item.activityImages[0]
        ? { uri: item.activityImages[0] }
        : require('../images/post1.jpg');

    return (
      <TouchableOpacity
        style={[styles.itemContainer, { width: itemWidth }]}
        onPress={() => navigation.navigate('ActivityDetails', { activityId: item.activityId })}
      >
        <Image source={activityImage} style={styles.itemImage} />
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => handleToggleLike(item.activityId)}
        >
          <Image
            source={require('../icons/heart.png')}
            style={[
              styles.heartImage,
              { tintColor: isActivityLiked(item.activityId) ? 'red' : 'gray' },
            ]}
          />
        </TouchableOpacity>
        <View style={styles.itemInfo}>
          <Text style={styles.title}>{item.activityTitle}</Text>
          <Text style={styles.price}>
            {item.pricePerGuest ? `From Rs ${item.pricePerGuest} / person` : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TopSection
        city={searchQuery ? searchQuery : 'No City Specified'}
        when={selectedDateRange ? selectedDateRange : 'Any week'}
        guests={
          guestDetails && guestDetails.category
            ? `${guestDetails.value} ${guestDetails.category}`
            : 'No Guests Specified'
        }
        onIconPress={() => navigation.navigate('UserTabs', { screen: 'Explore' })}
        onOtherPress={() => navigation.navigate('SearchScreen')}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#FF5A5F" style={{ marginTop: 20 }} />
      ) : activities.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No Results Found</Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.activityId}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default AfterSearch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  noResultsContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 18,
    color: '#555',
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 11,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginHorizontal: 10,
    gap: 20,
  },
  itemContainer: {
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 230,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  heartIcon: {
    position: 'absolute',
    top: 13,
    right: 13,
    borderRadius: 15,
    padding: 5,
  },
  heartImage: {
    width: 25,
    height: 25,
  },
  itemInfo: {
    marginTop: -2,
    padding: 5,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  price: {
    fontSize: 12,
    color: 'gray',
  },
});

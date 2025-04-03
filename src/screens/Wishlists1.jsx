import React, { useState, useEffect, useCallback, useContext } from 'react';  
import {  
  StyleSheet,  
  Text,  
  View,  
  FlatList,  
  Alert,  
} from 'react-native';  
import { useNavigation, useFocusEffect } from '@react-navigation/native';  
import AsyncStorage from '@react-native-async-storage/async-storage';  
import apiInstance from '../config/apiConfig'; // Import your axios instance  
import PostActivity from '../components/PostActivity';  
import NoWishlist from '../components/NoWishlist';
import { WishlistContext } from '../contexts/WishlistContext'; // Import WishlistContext

export default function Wishlists() {  
  const navigation = useNavigation();  
  const [wishlistActivities, setWishlistActivities] = useState([]);  
  const [loading, setLoading] = useState(true);  
  const [userId, setUserId] = useState(null);  
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const { toggleWishlist } = useContext(WishlistContext); // Get toggleWishlist from context

  // 1) Load current user ID once  
  useEffect(() => {  
    const loadUserId = async () => {  
      try {  
        const uid = await AsyncStorage.getItem('uid');  
        console.log('[Wishlists] Loaded userId:', uid);  
        setUserId(uid);  
      } catch (error) {  
        console.error('[Wishlists] Error loading user ID:', error);  
        setLoading(false);  
      }  
    };  
    loadUserId();  
  }, []);

  useFocusEffect(  
    useCallback(() => {  
      setLoading(true);

      const fetchData = async () => {  
        if (!userId) {  
          setLoading(false);  
          return;  
        }

        try {  
          const response = await apiInstance.get(`/getFullWishlistActivities/${userId}`);  
          if (response.data.success) {  
            setWishlistActivities(response.data.data);  
            setHasLoadedData(true); // Set this to true after successful data fetch  
          } else {  
            setWishlistActivities([]);  
            setHasLoadedData(true); // Still set this to true even if data is empty  
          }  
        } catch (err) {  
          console.error('[Wishlists] Error fetching from server:', err);  
          setWishlistActivities([]);  
          setHasLoadedData(true); // Set this to true even on error

          // Your existing error handling remains  
        } finally {  
          setLoading(false);  
        }  
      };

      fetchData();

      return () => {  
        // Clean-up function  
      };  
    }, [userId])  
  );

  const handlePress = (activityId) => {  
    navigation.navigate('ActivityDetails', {  
      activityId,  
      from: 'Wishlists'  // Add this line  
    });  
  };

  // Function to handle removing an item from wishlist
  const handleToggleWishlist = async (activityId) => {
    // Call the context function to toggle the wishlist item
    await toggleWishlist(activityId);
    
    // Update the local state by removing the activity
    setWishlistActivities(prev => prev.filter(activity => activity.id !== activityId));
  };

  // 4) Group activities into rows of 2  
  const groupedData = [];  
  for (let i = 0; i < wishlistActivities.length; i += 2) {  
    groupedData.push(wishlistActivities.slice(i, i + 2));  
  }

  // Change your conditional rendering to include the hasLoadedData check:  
  if (!loading && wishlistActivities.length === 0 && hasLoadedData) {  
    return (  
      <View style={styles.container}>  
        <NoWishlist />  
      </View>  
    );  
  }

  // 7) Otherwise, render the FlatList  
  return (  
    <View style={styles.container}>  
      <FlatList  
        data={groupedData}  
        renderItem={({ item }) => (  
          <View style={styles.row}>  
            {item.map((activity, index) => (  
              <View  
                key={activity.id}  
                style={styles.item}  
              >  
                <PostActivity  
                  image={{ uri: activity.activityImages[0] }}  
                  caption={activity.activityTitle}  
                  onPress={() => handlePress(activity.id)}  
                  onToggleWishlist={() => handleToggleWishlist(activity.id)} // Add this prop
                />  
              </View>  
            ))}  
            {/* Add another empty view with the same size as an item to ensure alignment */}  
            {item.length === 1 && <View style={styles.itemPlaceholder} />}  
          </View>  
        )}  
        keyExtractor={(item, index) => `row-${index}`}  
        ListHeaderComponent={<Text style={styles.headerText}>Wishlists</Text>}  
        contentContainerStyle={styles.listContainer}  
        sshowsVerticalScrollIndicator={true}  
        scrollEnabled={true}  
        // Making sure it can scroll even with few items  
        scrollEventThrottle={16}  
        disableScrollViewPanResponder={false}  
        nestedScrollEnabled={true}  
        // Ensure content is rendered fully  
        initialNumToRender={20}
      />  
    </View>  
  );  
}

const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: 'white',  
    paddingBottom: 20  
  },  
  headerText: {  
    fontSize: 38,  
    fontWeight: '600',  
    color: 'black',  
    marginVertical: 20,  
    textAlign: 'left',  
    marginLeft: 4,  
    marginTop: 67,  
    marginBottom: 25,  
    letterSpacing: 0.6,  
  },  
  listContainer: {  
    paddingHorizontal: 28,  // Increased padding for more space on edges  
    paddingBottom: 150,     // Extra padding to ensure scrolling works with few items  
    flexGrow: 1,            // This helps ensure content fills the space and scrolling works  
  },  
  row: {  
    flexDirection: 'row',  
    justifyContent: 'space-between', // Equal distribution  
    marginBottom: -6, // Your specific spacing between rows  
    width: '100%',    // Ensure row takes full width  
  },  
  item: {  
    width: '46%', // Slightly narrower to create more space between items  
  },  
  itemPlaceholder: {  
    width: '46%', // Same width as real items  
  },  
  loadingContainer: {  
    flex: 1,  
    justifyContent: 'center',  
    alignItems: 'center',  
    backgroundColor: 'white',  
  },  
  loadingText: {  
    marginTop: 15,  
    fontSize: 16,  
    color: '#FF5A5F',  
  },  
});
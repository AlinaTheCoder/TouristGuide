// Wishlists.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PostActivity from '../components/PostActivity';
import NoWishlist from '../components/NoWishlist';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Wishlists() {
  const navigation = useNavigation();
  const [wishlistActivities, setWishlistActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Load current user ID from AsyncStorage
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const uid = await AsyncStorage.getItem('uid');
        console.log("[Wishlists] Loaded userId:", uid);
        setUserId(uid);
      } catch (error) {
        console.error("[Wishlists] Error loading user ID:", error);
      }
    };
    loadUserId();
  }, []);

  // Realtime listener for wishlist updates using onValue
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const wishlistRef = database().ref(`wishlist/${userId}`);
    const onWishlistValue = async (snapshot) => {
      console.log("[Wishlists] Wishlist snapshot received:", snapshot.val());
      let wishlistActivityIds = [];
      snapshot.forEach(child => {
        if (child.val() === true) {
          wishlistActivityIds.push(child.key);
        }
      });
      console.log("[Wishlists] Liked activity IDs:", wishlistActivityIds);
      if (wishlistActivityIds.length === 0) {
        setWishlistActivities([]);
        setLoading(false);
        return;
      }
      // Fetch minimal details for each liked activity
      const activitiesRef = database().ref('activities');
      const fetchPromises = wishlistActivityIds.map(activityId =>
        activitiesRef.child(activityId).once('value').catch(error => {
          console.error(`[Wishlists] Error fetching activity ${activityId}:`, error);
          return null;
        })
      );
      const snapshots = await Promise.all(fetchPromises);
      const activities = [];
      snapshots.forEach(snap => {
        if (snap && snap.exists()) {
          const data = snap.val();
          console.log(`[Wishlists] Fetched activity ${snap.key}: ${data.activityTitle}`);
          activities.push({
            id: snap.key,
            activityTitle: data.activityTitle || 'Untitled Activity',
            activityImages: data.activityImages ? [data.activityImages[0]] : [],
          });
        }
      });
      console.log("[Wishlists] Final wishlist activities:", activities);
      setWishlistActivities(activities);
      setLoading(false);
    };

    wishlistRef.on('value', onWishlistValue, error => {
      console.error("[Wishlists] onValue error:", error);
      setLoading(false);
    });

    return () => wishlistRef.off('value', onWishlistValue);
  }, [userId]);

  const handlePress = (activityId) => {
    navigation.navigate('ActivityDetails', { activityId });
  };

  // Group activities into rows of 2
  const groupedData = [];
  for (let i = 0; i < wishlistActivities.length; i += 2) {
    groupedData.push(wishlistActivities.slice(i, i + 2));
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text style={styles.loadingText}>Loading Wishlists...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {wishlistActivities.length === 0 ? (
        <NoWishlist />
      ) : (
        <FlatList
          data={groupedData}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.map(activity => (
                <View key={activity.id} style={styles.item}>
                  <PostActivity
                    image={{ uri: activity.activityImages[0] }}
                    caption={activity.activityTitle}
                    onPress={() => handlePress(activity.id)}
                  />
                </View>
              ))}
            </View>
          )}
          keyExtractor={(item, index) => `row-${index}`}
          ListHeaderComponent={<Text style={styles.headerText}>Wishlists</Text>}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingBottom: 20 },
  headerText: { fontSize: 38, fontWeight: '600', color: 'black', marginVertical: 20, textAlign: 'left', marginLeft: 20, marginTop: 65, marginBottom: 25, letterSpacing: 0.6 },
  listContainer: { paddingHorizontal: 12 },
  row: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 20 },
  item: { flex: 1, marginHorizontal: 10, maxWidth: '48%' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  loadingText: { marginTop: 15, fontSize: 16, color: '#FF5A5F' },
});

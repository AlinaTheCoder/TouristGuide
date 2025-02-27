import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import HostsListingsPost from '../components/HostsListingsPost';
import NoListing from '../components/NoListing';
import { useNavigation } from '@react-navigation/native';
import apiInstance from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socket from '../config/socketConfig';

export default function Listings1() {
    const navigation = useNavigation();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hostId, setHostId] = useState('');

    // =========================================
    //  Fetch hostId dynamically
    // =========================================
    useEffect(() => {
        const fetchUid = async () => {
            try {
                const storedUid = await AsyncStorage.getItem('uid');
                if (storedUid) {
                    setHostId(storedUid);
                } else {
                    Alert.alert('Error', 'No UID found. Please log in.');
                }
            } catch (error) {
                console.error('Error fetching UID:', error);
                Alert.alert('Error', 'Failed to retrieve UID.');
            }
        };
        fetchUid();
    }, []);

    // =========================================
    //  Fetch Listings Once hostId is known
    // =========================================
    useEffect(() => {
        if (!hostId) return; // Only fetch if we have a valid hostId

        fetchListings();

        // =========================================
        //  Listen for real-time updates via socket
        // =========================================
        const handleActivitiesChanged = (payload) => {
            const { activityId, updatedData } = payload;
            // Only refresh if the changed activity belongs to THIS host
            if (updatedData?.hostId === hostId) {
                console.log('[Socket] Relevant activity changed:', activityId, updatedData);
                fetchListings();
            }
        };

        // Attach the listener
        socket.on('activities-changed', handleActivitiesChanged);

        // OPTIONAL: If your server also emits 'activities-removed'
        // you can listen for that as well:
        // socket.on('activities-removed', (payload) => {
        //   if (payload.removedData?.hostId === hostId) {
        //     console.log('[Socket] Activity removed:', payload.activityId);
        //     fetchListings();
        //   }
        // });

        // Cleanup listeners when component unmounts or hostId changes
        return () => {
            socket.off('activities-changed', handleActivitiesChanged);
            // socket.off('activities-removed');
        };
    }, [hostId]);
    
    // =========================================
    //  The same fetchListings function as before
    // =========================================
    const fetchListings = async () => {
        try {
            setLoading(true);
            const response = await apiInstance.get(`/getAllListedActivitiesByHostId/${hostId}`);

            console.log('[DEBUG] API Response:', response.data);

            if (response.data.success && response.data.data.length > 0) {
                const formattedListings = response.data.data.map(activity => ({
                    id: activity.id, // Keep the id
                    status: activity.status,
                    images: activity.images.map(imageUrl => ({ uri: imageUrl })),
                    caption: `You have listed activity on ${formatDate(activity.createdAt)}`,
                    address: activity.address,
                    city: activity.city
                }));
                setListings(formattedListings);
            } else {
                setListings([]);
            }
        } catch (err) {
            console.error('[ERROR] Fetching Listings:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    // =========================================
    //  Format "createdAt" to "Month Day, Year"
    // =========================================
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FF5A5F" />
          </View>
        );
      }

    // If no listings exist, show NoListing
    if (!loading && listings.length === 0) {
        return <NoListing />;
    }

    // =========================================
    //  Render the listings
    // =========================================
    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Your Listings</Text>
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => navigation.navigate('ActivityInformationScreen')}
                >
                    <Image source={require('../icons/Plus.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>

            {listings.map((post, index) => (
                <HostsListingsPost
                    key={index}
                    status={post.status}
                    images={post.images}
                    caption={post.caption}
                    address={post.address}
                    city={post.city}
                    onPress={() =>
                        navigation.navigate('HostActivityDetails', {
                            activityId: post.id,
                        })
                    }
                />
            ))}
        </ScrollView>
    );
}

// ========== Your original styles, unchanged ==========

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: 'white',
        paddingBottom: 80,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 80,
        paddingBottom: 12,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 38,
        fontWeight: '600',
        color: 'black',
        marginBottom: 8,
        marginTop: -13,
        marginLeft: 17,
    },
    iconContainer: {
        position: 'absolute',
        right: 25,
        top: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eaeaea',
        borderRadius: 25,
    },
    icon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: 'black',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
});

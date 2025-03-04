// src/contexts/WishlistContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from '../config/apiConfig';

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState({});

  // Load user’s wishlist from backend
  async function loadWishlist() {
    try {
      const userId = await AsyncStorage.getItem('uid');
      if (!userId) return;
      const response = await apiInstance.get(`/getWishlist/${userId}`);
      if (response.data.success) {
        // The data array contains activity IDs
        const ids = response.data.data;
        const temp = {};
        ids.forEach((aid) => {
          temp[aid] = true;
        });
        setWishlistIds(temp);
      }
    } catch (error) {
      // We just log here, so we don't show an alert from the context
      console.error('[WishlistProvider] loadWishlist error:', error);
    }
  }

  // Toggle function that updates the backend and local state
  async function toggleWishlist(activityId) {
    try {
      const userId = await AsyncStorage.getItem('uid');
      if (!userId) return;
      const response = await apiInstance.post(`/toggleWishlist/${userId}/${activityId}`);
      if (response.data.success) {
        const liked = response.data.liked;
        setWishlistIds((prev) => {
          const copy = { ...prev };
          if (liked) {
            copy[activityId] = true;
          } else {
            delete copy[activityId];
          }
          return copy;
        });
      }
    } catch (error) {
      // Log the error, but don't show a user-facing Alert in the context
      // The screen calling toggleWishlist can handle user feedback if desired
      console.error('[WishlistProvider] toggleWishlist error:', error);
    }
  }

  // On mount, load the wishlist once
  useEffect(() => {
    loadWishlist();
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, loadWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

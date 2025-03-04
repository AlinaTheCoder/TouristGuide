import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const OfflineFallback = ({ onRetry }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>No Internet Connection</Text>
      <Text style={styles.subtitle}>
        Please check your internet settings and try again.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OfflineFallback;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // match your app's background color
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF5A5F', // your accent color
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

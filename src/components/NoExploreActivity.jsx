import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NoExploreActivity = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>No Activity Available Yet!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 180,
  },
  text: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
});

export default NoExploreActivity;
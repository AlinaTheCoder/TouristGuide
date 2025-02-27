// components/PostActivity.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const PostActivity = ({ image, caption, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageWrapper}>
        <Image source={image} style={styles.image} />
      </View>
      <Text style={styles.caption} numberOfLines={3} ellipsizeMode="tail">
        {caption}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 15,
    alignItems: 'center',
  },
  imageWrapper: {
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 5,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  caption: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'left',
    width: 150,
  },
});

export default PostActivity;

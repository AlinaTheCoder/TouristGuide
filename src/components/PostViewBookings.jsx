// components/PostViewBookings.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image
} from 'react-native';


const { width: screenWidth } = Dimensions.get('window');


const PostViewBookings = ({
  PostImages,
  PostCaption,
  PostGuests,
  PostDate,
  PostTime,
  PostBookedBy
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);


  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / (screenWidth - 80));
    setActiveImageIndex(currentIndex);
  };


  return (
    <View style={styles.container}>
      <View style={styles.postContainer}>
        {/* Image Slider */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {PostImages.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.image} />
          ))}
        </ScrollView>


        {/* Dots for image slider */}
        <View style={styles.dotContainer}>
          {PostImages.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                activeImageIndex === idx && styles.activeDot,
              ]}
            />
          ))}
        </View>


        {/* Caption, Guest, Date, Time, and BookedBy */}
        <View style={styles.captionContainer}>
          <View style={styles.captionRow}>
            <Text style={styles.caption}>{PostCaption}</Text>
            <Text style={styles.bookedBy}>{PostBookedBy}</Text>
          </View>
          <View style={styles.dateBookedRow}>
            <Text style={styles.dateTime}>
              {PostDate} | {PostTime}
            </Text>
            <Text style={styles.guest}>{PostGuests} Guest</Text>
          </View>
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  postContainer: {
    marginVertical: 14,
    marginHorizontal: 22,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    position: 'relative',
    marginTop: 25,
  },
  image: {
    width: screenWidth - 44,
    height: 280,
    borderRadius: 10,
  },
  captionContainer: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  captionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caption: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  dateTime: {
    fontSize: 14,
    fontWeight: '400',
    color: '#555',
  },
  dateBookedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  bookedBy: {
    fontSize: 14,
    fontWeight: '400',
    color: '#555',
  },
  guest: {
    fontSize: 14,
    fontWeight: '400',
    color: '#555',
  },
  dotContainer: {
    position: 'absolute',
    top: 250,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'lightgrey',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
    width: 11,
    height: 11,
    borderRadius: 6,
  },
});


export default PostViewBookings;
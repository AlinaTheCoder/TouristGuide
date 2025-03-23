import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { WishlistContext } from '../contexts/WishlistContext';


const { width: screenWidth } = Dimensions.get('window');


const PostSection = ({
  PostImages,
  PostCaption,
  PostDate,
  onPress,
  activityId,
}) => {
  // Active dot state
  const [activeImageIndex, setActiveImageIndex] = useState(0);


  // Access the context's wishlist and toggle function
  const { wishlistIds, toggleWishlist } = useContext(WishlistContext);


  // No local state. Instead, check the context directly for the liked state:
  const isLiked = !!wishlistIds[activityId];


  // Toggling calls the context function, which updates wishlistIds
  const handleToggleLike = () => {
    toggleWishlist(activityId);
  };


  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / screenWidth);
    setActiveImageIndex(currentIndex);
  };


  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.postContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {PostImages.map((image, index) => (
            <Image key={index} source={image} style={styles.image} />
          ))}
        </ScrollView>
        <View style={styles.dotContainer}>
          {PostImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeImageIndex && styles.activeDot
              ]}
            />
          ))}
        </View>


        {/* Heart icon toggles the wishlist */}
        <TouchableOpacity style={styles.likeIcon} onPress={handleToggleLike}>
          <Image
            source={require('../icons/heart.png')}
            style={[styles.heartImage, { tintColor: isLiked ? 'red' : 'gray' }]}
          />
        </TouchableOpacity>


        <View style={styles.captionContainer}>
          <Text style={styles.caption}>{PostCaption}</Text>
          <Text style={styles.date}>{PostDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  container: { backgroundColor: 'white' },
  postContainer: {
    marginVertical: 14,
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    position: 'relative',
  },
  image: {
    width: screenWidth - 30,
    height: 380,
    borderRadius: 10,
  },
  likeIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    borderRadius: 15,
    padding: 5,
  },
  heartImage: {
    width: 30,
    height: 30,
  },
  captionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 5,
    marginLeft: 10,
    marginRight: 10,
  },
  caption: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  date: {
    fontSize: 14,
    fontWeight: '400',
    color: '#888',
    alignSelf: 'flex-end',
  },
  dotContainer: {
    position: 'absolute',
    top: 350,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
});

export default PostSection;


import React, { useState, useRef, useEffect } from 'react';  
import { View, Text, Image, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';  
import { useFocusEffect } from '@react-navigation/native';  
import apiInstance from '../config/apiConfig';

const { width: screenWidth } = Dimensions.get('window');

const Feedbacks = ({ activityId }) => {  
  const [reviews, setReviews] = useState([]);  
  const [loading, setLoading] = useState(true);  
  const [currentIndex, setCurrentIndex] = useState(0);  
  const scrollViewRef = useRef(null);

  const fetchReviews = async () => {  
    if (!activityId) return;

    try {  
      setLoading(true);  
      const response = await apiInstance.get(`/feedback/activity/${activityId}`);

      if (response.data.success) {  
        // Sort by updatedAt timestamp if it exists, otherwise by createdAt  
        const sortedReviews = (response.data.feedback || []).sort((a, b) => {  
          const aTime = a.updatedAt || a.createdAt || 0;  
          const bTime = b.updatedAt || b.createdAt || 0;  
          return bTime - aTime; // Most recent first  
        });  
        setReviews(sortedReviews);  
      } else {  
        console.error('Error fetching reviews:', response.data.error);  
      }  
    } catch (error) {  
      console.error('Error fetching reviews:', error);  
    } finally {  
      setLoading(false);  
    }  
  };

  // Initial load  
  useEffect(() => {  
    fetchReviews();  
  }, [activityId]);

  // Add useFocusEffect to refresh on screen focus  
  useFocusEffect(  
    React.useCallback(() => {  
      fetchReviews();  
      return () => {}; // cleanup  
    }, [activityId])  
  );

  // Handle scroll events to update the current index  
  const handleScroll = (event) => {  
    const offsetX = event.nativeEvent.contentOffset.x;  
    const index = Math.round(offsetX / screenWidth);  
    setCurrentIndex(index);  
  };

  // Function to get initials from name  
  const getInitials = (name) => {  
    if (!name) return '?';  
    return name  
      .split(' ')  
      .map(part => part.charAt(0))  
      .join('')  
      .toUpperCase()  
      .substring(0, 2);  
  };

  // Tag icons mapping based on specified categories  
  const getIconForTag = (tag) => {  
    switch (tag) {  
      case 'Activity Safety':  
        return '🛡️'; // Shield for safety  
      case 'Guide Knowledge':  
        return '🧠'; // Brain for knowledge  
      case 'Equipment Quality':  
        return '🔧'; // Wrench for equipment  
      case 'Scenic Views':  
        return '🏞️'; // Landscape for scenic views  
      case 'Time Management':  
        return '⏱️'; // Stopwatch for time management  
      case 'Booking Experience':  
        return '📅'; // Calendar for booking  
      default:  
        return '👍'; // Thumbs up as default  
    }  
  };

  // Function to determine which dots to show based on the number of reviews  
  const renderDots = () => {  
    const totalReviews = reviews.length;  
     
    // If only one review, show one active dot  
    if (totalReviews === 1) {  
      return (  
        <View key={0} style={[styles.dot, { backgroundColor: "#FF5A5F" }]} />  
      );  
    }  
     
    // If two reviews, show two dots with the active one highlighted  
    if (totalReviews === 2) {  
      return reviews.map((_, index) => (  
        <View  
          key={index}  
          style={[  
            styles.dot,  
            { backgroundColor: index === currentIndex ? "#FF5A5F" : "lightgray" }  
          ]}  
        />  
      ));  
    }  
     
    // If three or more reviews, show three dots with special logic  
    if (totalReviews >= 3) {  
      // For three dots: first, middle, last  
      return (  
        <>  
          {/* First dot - active when on first review */}  
          <View  
            style={[  
              styles.dot,  
              { backgroundColor: currentIndex === 0 ? "#FF5A5F" : "lightgray" }  
            ]}  
          />  
           
          {/* Middle dot - active when on any middle review */}  
          <View  
            style={[  
              styles.dot,  
              { backgroundColor: (currentIndex > 0 && currentIndex < totalReviews - 1) ? "#FF5A5F" : "lightgray" }  
            ]}  
          />  
           
          {/* Last dot - active when on last review */}  
          <View  
            style={[  
              styles.dot,  
              { backgroundColor: currentIndex === totalReviews - 1 ? "#FF5A5F" : "lightgray" }  
            ]}  
          />  
        </>  
      );  
    }  
     
    return null;  
  };

  if (loading) {  
    return (  
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>  
        <ActivityIndicator size="small" color="#FF5A5F" />  
        <Text style={{ marginTop: 8, color: '#FF5A5F' }}>Loading reviews...</Text>  
      </View>  
    );  
  }

  if (reviews.length === 0) {  
    return (  
      <View style={[styles.container, { alignItems: 'left', justifyContent: 'center', padding: 20 }]}>  
        <Text style={{ fontSize: 16, color: '#555', textAlign: 'left' }}>  
          No Reviews Yet!  
        </Text>  
      </View>  
    );  
  }

  return (  
    <View style={styles.container}>  
      <ScrollView  
        ref={scrollViewRef}  
        horizontal  
        pagingEnabled  
        showsHorizontalScrollIndicator={false}  
        onScroll={handleScroll}  
        scrollEventThrottle={16}  
      >  
        {reviews.map((review, index) => (  
          <View key={index} style={styles.reviewSlide}>  
            {/* Review Header */}  
            <View style={styles.reviewHeader}>  
              {review.userProfileImage ? (  
                <Image  
                  source={{ uri: review.userProfileImage }}  
                  style={styles.reviewerImage}  
                />  
              ) : (  
                <View  
                  style={[  
                    styles.reviewerImage,  
                    {  
                      backgroundColor: "#000000", // Black background for initials  
                      justifyContent: 'center',  
                      alignItems: 'center',  
                    }  
                  ]}  
                >  
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>  
                    {getInitials(review.userName)}  
                  </Text>  
                </View>  
              )}  
              <View style={styles.reviewerInfo}>  
                <Text style={styles.reviewerName}>{review.userName || 'Anonymous'}</Text>  
              </View>  
            </View>  
             
            {/* Star Rating */}  
            <View style={styles.starsContainer}>  
              {[...Array(5)].map((_, starIndex) => (  
                <Image  
                  key={starIndex}  
                  source={require("../images/star_filled.png")}  
                  style={[  
                    styles.starIcon,  
                    starIndex >= review.rating && { tintColor: "#D3D3D3" }  
                  ]}  
                />  
              ))}  
              <Text style={styles.reviewTime}>{review.time}</Text>  
            </View>  
             
            {/* Tags above review text */}  
            {review.highlights && review.highlights.length > 0 && (  
              <View style={styles.tagBandContainer}>  
                <View style={styles.tagBand}>  
                  {review.highlights.map((highlight, hIndex) => (  
                    <View  
                      key={hIndex}  
                      style={styles.tagItem}  
                    >  
                      <Text style={styles.tagIcon}>{getIconForTag(highlight)}</Text>  
                      <Text style={styles.tagText}>{highlight}</Text>  
                    </View>  
                  ))}  
                </View>  
              </View>  
            )}  
             
            {/* Review Text */}  
            <Text style={styles.reviewText}>  
              {review.text}  
            </Text>  
          </View>  
        ))}  
      </ScrollView>  
       
      {/* Custom Pagination Dots */}  
      <View style={styles.dotContainer}>  
        {renderDots()}  
      </View>  
    </View>  
  );  
};

const styles = StyleSheet.create({  
  container: {  
    paddingVertical: 14,  
    marginTop: 4,  
    marginBottom: -6  
  },  
  reviewSlide: {  
    width: screenWidth,  
    paddingHorizontal: 20,  
  },  
  reviewHeader: {  
    flexDirection: "row",  
    alignItems: "center",  
  },  
  reviewerImage: {  
    width: 45,  
    height: 45,  
    borderRadius: 22.5,  
    marginRight: 10,  
  },  
  reviewerInfo: {  
    flex: 1,  
    textAlign: 'justify'  
  },  
  reviewerName: {  
    fontSize: 18,  
    fontWeight: "600",  
    color: "#333",  
  },  
  starsContainer: {  
    flexDirection: "row",  
    alignItems: "center",  
    marginTop: 18,  
    marginBottom: 12,  
  },  
  starIcon: {  
    width: 22,  
    height: 22,  
    tintColor: "#FF5A5F", // for stars  
    marginRight: 2,  
  },  
  reviewTime: {  
    fontSize: 15,  
    color: "#777",  
    marginLeft: 8,  
  },  
  // Tag styles  
  tagBandContainer: {  
    marginBottom: 15,  
    marginTop: 5,  
  },  
  tagBand: {  
    flexDirection: 'row',  
    flexWrap: 'wrap',  
    marginHorizontal: -5,  
  },  
  tagItem: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    margin: 5,  
    paddingVertical: 7,  
    paddingHorizontal: 10,  
    backgroundColor: 'white',  
    borderRadius: 20,  
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.1,  
    shadowRadius: 3,  
    elevation: 3,  
    borderWidth: 1,  
    borderColor: '#EFEFEF',  
  },  
  tagIcon: {  
    fontSize: 15,  
    marginRight: 6,  
  },  
  tagText: {  
    color: '#333',  
    fontWeight: '600',  
    fontSize: 12,  
  },  
  reviewText: {  
    fontSize: 15,  
    lineHeight: 22,  
    color: "#555",  
    textAlign: 'justify'  
  },  
  dotContainer: {  
    flexDirection: 'row',  
    justifyContent: 'center',  
    alignItems: 'center',  
    marginTop: 25,  
  },  
  dot: {  
    width: 8,  
    height: 8,  
    borderRadius: 4,  
    marginHorizontal: 4,  
  },  
});

export default Feedbacks;
// components/TripsBlock.jsx
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function TripsBlock({ activity, onEdit }) {
  const navigation = useNavigation();
  const {
    image,
    title,
    bookingDate,
    startTime,
    endTime,
    price,
    guests,
    host,
    reviewEligibleTimestamp,
    hasFeedback
  } = activity;

  // Determine if the review option should be shown
  const shouldShowReviewIcon = () => {
    // Don't show if user has already submitted feedback
    if (hasFeedback) return false;
    
    // Don't show if reviewEligibleTimestamp is not available
    if (!reviewEligibleTimestamp) return false;
    
    // Show only if current time is past the eligible timestamp (24h after booking)
    const currentTime = Date.now();
    return currentTime >= reviewEligibleTimestamp;
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <Image
            source={typeof image === 'string' ? { uri: image } : image}
            style={styles.activityImage}
          />
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.value}>{bookingDate}</Text>
            <Text style={styles.separator}> | </Text>
            <View style={styles.detailRow}>
              <Text style={styles.value}>{startTime}</Text>
              <Text style={styles.separator}>-</Text>
              <Text style={styles.value}>{endTime}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.value}>{price}</Text>
            <Text style={styles.separator}> | </Text>
            <Text style={styles.value}>{guests}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.value}>{host}</Text>
          </View>
        </View>
      </View>
      
      {/* Conditional Feedback Button - Only show if eligible and not already reviewed */}
      {shouldShowReviewIcon() && (
        <TouchableOpacity
          style={styles.feedbackButton}
          onPress={() => navigation.navigate('FeedbackScreen', { activityId: activity.id })}
          activeOpacity={0.7}
        >
          <View style={styles.feedbackContent}>
            <Image
              source={require('../icons/review_icon.png')}
              style={styles.feedbackIcon}
            />
            <Text style={styles.feedbackText}>Share Your Experience!</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    margin: 10,
    marginTop: 17,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 18,
    paddingBottom: 18,
  },
  leftSection: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 10,
  },
  activityImage: {
    width: 110,
    height: 116,
    borderRadius: 10,
    resizeMode: 'cover',
    marginLeft: 7,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginTop: 2,
    marginBottom: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  separator: {
    fontSize: 14,
    color: '#000',
    marginHorizontal: 4,
  },
  value: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000',
  },
  feedbackButton: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  feedbackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 10,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF5A5F',
  },
});
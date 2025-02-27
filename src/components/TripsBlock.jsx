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
    host
  } = activity;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      // MAIN CHANGE: navigate to ActivityDetails with activityId
      onPress={() => navigation.navigate('ActivityDetails', { activityId: activity.id })}
    >
      <View style={styles.leftSection}>
        {/* If image is a string URL, wrap with { uri: image } */}
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

      {/* Edit Icon for e.g. AvailabilityScheduleDetails */}
      <TouchableOpacity
        style={styles.editIcon}
        onPress={onEdit}
        activeOpacity={0.7}
      >
        <Image
          source={require('../images/review_icon.png')}
          style={styles.editImage}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 12,
    marginTop: 17,
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
  editIcon: {
    marginLeft: -20,
    marginTop: 94,
  },
  editImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
});

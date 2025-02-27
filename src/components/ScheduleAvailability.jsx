// components/ScheduleAvailability.js
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

export default function ScheduleAvailability({ activity, onEdit }) {
  const {
    image,
    title,
    startDate,
    endDate,
    startTime,
    endTime,
  } = activity; // Notice we're using the mapped item structure now

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Image source={image} style={styles.activityImage} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.value}>{startDate}</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.value}>{endDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.value}>{startTime}</Text>
          <Text style={styles.separator}>-</Text>
          <Text style={styles.value}>{endTime}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.editIcon}
        onPress={onEdit}
        activeOpacity={0.7}
      >
        <View style={styles.circleBackground}>
          <Image
            source={require('../icons/edit.png')}
            style={styles.editImage}
          />
        </View>
      </TouchableOpacity>
    </View>
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
    padding: 10,
  },
  leftSection: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 15,
  },
  activityImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    resizeMode: 'cover',
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
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 4,
  },
  value: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000',
  },
  editIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  circleBackground: {
    width: 35,
    height: 35,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImage: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
});

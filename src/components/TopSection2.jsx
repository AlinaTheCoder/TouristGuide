// TopSection2.js
import React from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';

const TopSection = ({ onIconPress, onOtherPress, city, when, guests }) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <TouchableOpacity style={styles.searchContainer} onPress={onOtherPress}>
          <TouchableOpacity onPress={onIconPress}>
            <Image source={require('../icons/BackArrow.png')} style={styles.backArrowIcon} />
          </TouchableOpacity>
          <View style={styles.textWrapper}>
            <Text style={styles.whereToText}>
              {city ? city : "No City Specified"}
            </Text>
            <Text style={styles.filterText}>
              {when ? when : "Any week"} · {guests ? guests : "No Guests Specified"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.horizontalLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    width: 388,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingHorizontal: 15,
    paddingVertical: 13,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  backArrowIcon: {
    width: 19,
    height: 19,
    marginRight: 15,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  textWrapper: {
    flex: 1,
  },
  whereToText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
  },
  filterText: {
    fontSize: 13,
    color: '#555',
    marginTop: 3,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: '#ccc',
    marginTop: 15,
  },
});

export default TopSection;

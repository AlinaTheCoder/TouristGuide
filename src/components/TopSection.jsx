// TopSection.js
import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';

const TopSection = ({ onIconPress, onOtherPress, selectedCategory, onCategorySelect, onChatPress }) => {
  // We no longer need local state for the selected icon;
  // the parent (Explore) manages selectedCategory.

  const iconData = [
    { id: 1, title: 'Hiking', iconPath: require('../icons/hiking.jpg') },
    { id: 2, title: 'Beaches', iconPath: require('../icons/beach.jpg') },
    { id: 3, title: 'Surfing', iconPath: require('../icons/surfing.jpg') },
    { id: 4, title: 'Skiing', iconPath: require('../icons/skiing.jpg') },
    { id: 5, title: 'Boating', iconPath: require('../icons/boating.jpg') },
    { id: 6, title: 'Cooking', iconPath: require('../icons/cooking.jpg') },
    { id: 7, title: 'Paragliding', iconPath: require('../icons/paragliding.png') },
    { id: 8, title: 'Playing', iconPath: require('../icons/play.jpg') },
    { id: 9, title: 'Ziplining', iconPath: require('../icons/zipline.png') },
  ];

  return (
    <View style={styles.container}>
      {/* Touchable search bar section with chat bubble */}
      <View style={styles.searchWrapper}>
        <TouchableOpacity style={styles.searchContainer} onPress={onOtherPress}>
          <TouchableOpacity onPress={onIconPress}>
            <Image source={require('../icons/search.png')} style={styles.searchIcon} />
          </TouchableOpacity>
          <View style={styles.textWrapper}>
            <Text style={styles.whereToText}>Where to?</Text>
            <Text style={styles.filterText}>Anywhere · Any week · Add guests</Text>
          </View>
        </TouchableOpacity>
        
        {/* Chat Assistant Bubble */}
        <TouchableOpacity style={styles.chatBubble} onPress={onChatPress}>
          <Image source={require('../icons/assistant.png')} style={styles.chatIcon} />
        </TouchableOpacity>
      </View>

      {/* Horizontal scrollable icons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconContainer}>
        {iconData.map((icon) => {
          const isSelected = selectedCategory === icon.title;
          return (
            <TouchableOpacity
              key={icon.id}
              style={styles.iconButton}
              onPress={() => {
                // Tell parent that user tapped this category
                onCategorySelect(icon.title);
              }}
            >
              <Image
                source={icon.iconPath}
                style={[
                  styles.iconImage,
                  isSelected && styles.selectedIconImage,
                ]}
              />
              <Text
                style={[
                  styles.iconText,
                  isSelected && styles.selectedText,
                ]}
              >
                {icon.title}
              </Text>
              {isSelected && <View style={styles.underline} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Horizontal line below the icons */}
      <View style={styles.horizontalLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    width: 388,
    marginLeft: 4,
    marginRight: 10
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingHorizontal: 15,
    paddingVertical: 13,
    elevation: 5,  // Elevation for Android shadow
    shadowColor: '#000',  // Shadow properties for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  searchIcon: {
    width: 21,
    height: 21,
    marginRight: 15,
    marginLeft: 8,
    fontWeight: 'bold'
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
    marginTop: 3
  },
  // Chat bubble styles
  chatBubble: {
    backgroundColor: '#fff',
    borderRadius: 50,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,  // Elevation for Android shadow
    shadowColor: '#000',  // Shadow properties for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  chatIcon: {
    width: 36,
    height: 36,
  },
  iconContainer: {
    marginTop: 9,
    marginLeft: 0,
    flexDirection: 'row',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
    marginRight: 35,
  },
  iconImage: {
    width: 30,
    height: 30,
  },
  selectedIconImage: {
    tintColor: '#000', // Apply black color when icon is selected
  },
  iconText: {
    fontSize: 14,
    color: '#555',
    marginTop: 10,
    textAlign: 'center',
  },
  selectedText: {
    fontWeight: 'bold',
    color: '#000', // Apply black color to text when selected
  },
  underline: {
    height: 2,
    backgroundColor: '#000', // Black underline
    width: '100%',
    marginTop: 10,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: '#ccc',
    marginTop: 15,
  },
});

export default TopSection;
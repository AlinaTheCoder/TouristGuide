import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    Dimensions,
    TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function HostsListingsPost({ status, images, caption, address, city, onPress }) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const handleScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(offsetX / width);
        setActiveImageIndex(currentIndex);
    };


    const getStatusDisplay = (currentStatus) => {
        switch (currentStatus) {
            case 'Pending':
                return {
                    text: 'In Progress',
                    color: '#FFA500'  // Orange
                };
            case 'Accepted':
                return {
                    text: 'Accepted',
                    color: '#4CAF50'  // Green
                };
            case 'Rejected':
                return {
                    text: 'Rejected',
                    color: '#FF0000'  // Red
                };
            default:
                return {
                    text: currentStatus,
                    color: '#FF7518'  // Default color
                };
        }
    };

    return (
        <View style={styles.container}>
            {/* Image Slider */}
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {images.map((image, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => onPress(index)} // Use the onPress function passed as a prop
                        activeOpacity={0.9} // Adjust the opacity for better user feedback
                    >
                        <View style={styles.imageWrapper}>
                            <Image source={image} style={styles.image} />

                            {/* Status Badge */}

                            <View style={styles.statusBadge}>
                                <View
                                    style={[
                                        styles.statusDot,
                                        status === 'Accepted' && { backgroundColor: '#4CAF50' },
                                        status === 'Pending' && { backgroundColor: '#FFA500' },
                                        status === 'Rejected' && { backgroundColor: '#FF0000' },
                                    ]}
                                />
                                <Text style={styles.statusText}>
                                    {status === 'Pending' ? 'In Progress' : status}
                                </Text>
                            </View>

                            {/* Dots Indicator inside the image */}
                            <View style={[
                                styles.dotsContainer,
                                { width: images.length * 16, left: (width - images.length * 16) / 2 },
                            ]}>
                                {images.map((_, dotIndex) => (
                                    <View
                                        key={dotIndex}
                                        style={[styles.dotIndicator, activeImageIndex === dotIndex && styles.activeDot]}
                                    />
                                ))}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Description */}
            <View style={styles.descriptionContainer}>
                <Text style={styles.caption}>{caption}</Text>
                <Text style={styles.address}>{address}{" , "}{city}</Text>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    imageWrapper: {
        width: width - 32,
        height: 350,
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    dotsContainer: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    dotIndicator: {
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
        borderRadius: 7,
    },
    descriptionContainer: {
        paddingHorizontal: 25,
        paddingVertical: 10,
    },
    caption: {
        fontSize: 16,
        fontWeight: '500',
        color: 'black',
        marginBottom: 4,
    },
    address: {
        fontSize: 14,
        fontWeight: '400',
        color: '#888',
    },
    statusBadge: {
        position: 'absolute',
        top: 15,
        left: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 50,
        elevation: 5,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF7518', // Default color for the status dot
        marginRight: 6,
    },
    statusText: {
        color: 'black',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

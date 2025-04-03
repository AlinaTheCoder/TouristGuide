import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';


// Get screen height for responsive calculations
const { height } = Dimensions.get('window');


export default function NoAnalytics({ hostName = '' }) {
    // Changed default active tab to 'Currently Hosting' since it's now the first tab
    const [activeTab, setActiveTab] = useState('Currently Hosting');


    const getReservationText = () => {
        switch (activeTab) {
            case 'Currently Hosting':
                return "You don't have any guests staying with you right now.";
            case 'Arriving Soon':
                return "You don't have any guests arriving today or tomorrow.";
            case 'Upcoming':
                return "You currently don't have any upcoming guests.";
            case 'Checking Out':
                return "You don't have any guests checking out today or tomorrow.";
            default:
                return "You don't have any guests staying with you right now.";
        }
    };


    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Welcome Section */}
            <Text style={styles.welcomeText}>Welcome, {hostName}!</Text>
            <View style={styles.block}>


            {/* Your Reservations Section */}
            <Text style={styles.reservationsText}>Your Reservations</Text>


            {/* Horizontal Scrollable Tabs - Rearranged in the requested order */}
            <ScrollView horizontal style={styles.tabsContainer} showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Currently Hosting' && styles.activeTab]}
                    onPress={() => setActiveTab('Currently Hosting')}
                >
                    <Text style={activeTab === 'Currently Hosting' ? styles.tabTextActive : styles.tabText}>
                        Currently Hosting (0)
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Arriving Soon' && styles.activeTab]}
                    onPress={() => setActiveTab('Arriving Soon')}
                >
                    <Text style={activeTab === 'Arriving Soon' ? styles.tabTextActive : styles.tabText}>
                        Arriving Soon (0)
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]}
                    onPress={() => setActiveTab('Upcoming')}
                >
                    <Text style={activeTab === 'Upcoming' ? styles.tabTextActive : styles.tabText}>
                        Upcoming (0)
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Checking Out' && styles.activeTab]}
                    onPress={() => setActiveTab('Checking Out')}
                >
                    <Text style={activeTab === 'Checking Out' ? styles.tabTextActive : styles.tabText}>
                        Checking Out (0)
                    </Text>
                </TouchableOpacity>
            </ScrollView>


            {/* Multiple Containers if you want to add then change the number in array */}
            {[...Array(1)].map((_, index) => (
                <View key={index} style={styles.noReservationContainer}>
                    <Image source={require('../icons/forbidden.png')} style={styles.image} />
                    <Text style={styles.noReservationText}>{getReservationText()}</Text>
                </View>
            ))}


            {/* All Reservations Link */}
            <View>
                <Text style={styles.allReservationsLink}>All Reservations (0)</Text>
            </View>
            </View>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    welcomeText: {
        fontSize: 38,
        fontWeight: '600',
        color: 'black',
        marginVertical: 20,
        textAlign: 'left',
        marginLeft: 20,
        marginTop: 65,
        marginBottom: 25,
        letterSpacing: 0.6,
    },
    block:{
        marginHorizontal: 22,


    },
    reservationsText: {
        marginTop: 20,
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 15,
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        paddingHorizontal: 2,
    },
    tab: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: 'white',
        marginRight: 10,
        borderColor: '#e0e0e0',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
    },
    activeTab: {
        borderColor: '#000000',
        borderWidth: 1,
    },
    tabText: {
        color: '#888888',
        fontSize: 14,
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '500',
    },
    noReservationContainer: {
        backgroundColor: '#f2f2f2',
        borderRadius: 12,
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop:10,
        marginBottom: 20,
        minHeight: height * 0.4, // Responsive fixed height equivalent to 40%
    },
    image: {
        width: 25,
        height: 25,
        marginBottom: 10,
    },
    noReservationText: {
        color: '#888888',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginHorizontal:40,
        lineHeight: 16
    },
    allReservationsLink: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        textDecorationLine: 'underline',
        marginRight: 200,
        marginLeft:5,
    },
});

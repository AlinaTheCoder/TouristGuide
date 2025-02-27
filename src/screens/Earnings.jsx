import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from "@react-navigation/native"; // For navigation

const Earnings = () => {
    const navigation = useNavigation();

    // State to manage the horizontal offset of the chart
    const [chartOffset, setChartOffset] = useState(0);

    // Chart data
    const chartData = {
        labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
        datasets: [
            {
                data: [10, 5, 7, 3, 9, 6, 8, 4], // Example data points
            },
        ],
    };


    const chartWidth = Dimensions.get('window').width * 1.5; // Chart width to allow horizontal scrolling


    // Function to scroll the chart to the right
    const handleScrollRight = () => {
        setChartOffset((prev) => prev + 100); // Shift the offset 100 pixels to the right
    };


    // Function to scroll the chart to the left
    const handleScrollLeft = () => {
        setChartOffset((prev) => (prev - 100 < 0 ? 0 : prev - 100)); // Shift 100 pixels to the left, ensuring offset doesn't go negative
    };


    return (
        <View style={styles.container}>

            <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={require('../icons/BackArrow.png')} style={styles.headerImage} />
            </TouchableOpacity>
            <Text style={styles.headerText}>Earnings</Text>
            </View>

            {/* Earnings Display */}
            <View style={styles.earningsSection}>
                <Text style={styles.earningsText}>You’ve made</Text>
                <Text style={styles.amountText}>$0.00</Text>
                <Text style={styles.earningsText}>this month</Text>
            </View>

            {/* Graph Section */}
            <View style={styles.chartWrapper}>
                {/* Left & Right Arrows for Navigation */}
                <View style={styles.topIconsContainer}>
                    {/* Left Arrow */}
                    <TouchableOpacity onPress={handleScrollLeft} style={styles.iconButton}>
                        <View style={styles.iconWrapper}>
                            <Image
                                source={require('../icons/left.png')} // Replace with your left arrow image path
                                style={styles.iconStyle}
                            />
                        </View>
                    </TouchableOpacity>


                    {/* Right Arrow */}
                    <TouchableOpacity onPress={handleScrollRight} style={styles.iconButton}>
                        <View style={styles.iconWrapper}>
                            <Image
                                source={require('../icons/right.png')} // Replace with your right arrow image path
                                style={styles.iconStyle}
                            />
                        </View>
                    </TouchableOpacity>
                </View>


                {/* Scrollable Chart */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentOffset={{ x: chartOffset, y: 0 }} // Apply the offset to scroll the chart programmatically
                >
                    <LineChart
                        data={chartData}
                        width={chartWidth}
                        height={300}
                        yAxisLabel="$"
                        yAxisSuffix=""
                        yAxisInterval={1} // Interval for the y-axis
                        chartConfig={{
                            backgroundGradientFrom: '#f3f4f7',
                            backgroundGradientTo: '#eef0f3',
                            decimalPlaces: 0,
                            color: (opacity = 1) =>`rgba(34, 139, 230, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            propsForDots: {
                                r: '5',
                                strokeWidth: '2',
                                stroke: '#ff4757',
                            },
                            propsForBackgroundLines: {
                                strokeDasharray: '', // Solid lines
                                strokeWidth: 1,
                                stroke: '#ddd',
                            },
                        }}
                        bezier
                        style={styles.chart}
                    />
                </ScrollView>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white'},
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center', // Centers items vertically
        justifyContent: 'center', // Ensures content is horizontally centered
        backgroundColor: '#fff', // Background color for the header
        borderBottomWidth: 1,
        borderBottomColor: '#ddd', // Subtle bottom border
        position: 'absolute', // Makes it sticky
        top: 1, // Ensures it starts at the very top of the screen
        left: 0, // Aligns it to the left edge
        right: 0, // Ensures it spans the full width of the screen
        zIndex: 1, // Keeps it above other elements
        width: '100%', // Ensures it spans the full screen width
        height: 55, // Set a fixed height for the header
        paddingHorizontal: 10, // Adds horizontal padding for better alignment
        marginBottom: 50
    },
    headerImage: {
        width: 18,
        height: 18,
        marginTop: 0,
        marginLeft: 8
    },
    headerText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000', // Contrast text color
        textAlign: 'center', // Ensures text is centered
        flex: 1, // Allows the text to take the remaining space
        marginTop: -2,
        marginLeft: -19
    },
    earningsSection: { alignItems: 'flex-start', margin: 20, paddingTop: 90 },
    earningsText: { fontSize: 25, fontWeight: '500', color: 'black' },
    amountText: { fontSize: 38, fontWeight: '600', marginVertical: 2, color: 'black' },
    chartWrapper: { marginVertical: 16, paddingHorizontal: 20, position: 'relative', paddingTop: 45 },
    topIconsContainer: {
        position: 'absolute',
        top: 5,
        right: 17,
        flexDirection: 'row',
        zIndex: 1,
    },
    iconButton: { marginHorizontal: 5 },
    iconWrapper: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 50,
        padding: 5,
    },
    iconStyle: { width: 15, height: 15, resizeMode: 'contain' },
    chart: { marginVertical: 8, borderRadius: 8 },
    summaryButton: {
        margin: 20,
        padding: 12,
        backgroundColor: '#E5E4E2',
        borderRadius: 8,
        alignItems: 'center',
        width: 200,
    },
    summaryText: { fontSize: 16, color: 'black' },
    upcomingSection: { margin: 20 },
    upcomingTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
    upcomingText: { fontSize: 16, color: 'grey' },
});


export default Earnings;
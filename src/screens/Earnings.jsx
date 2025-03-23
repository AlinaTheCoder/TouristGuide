import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from '../config/apiConfig';

const screenWidth = Dimensions.get('window').width;

const Earnings = () => {
  const [activeTab, setActiveTab] = useState('Monthly');
  const [loading, setLoading] = useState(true);
  const [hostName, setHostName] = useState('');
  const [earningsData, setEarningsData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activitiesData, setActivitiesData] = useState({});

  // Local image icons
  const salesIcons = {
    totalSales: require('../icons/sales.png'),
    totalOrder: require('../icons/orders.png'),
  };

  // Enhanced currency parsing function
  const parseCurrency = (currencyStr) => {
    if (!currencyStr) return 0;
    // Remove all non-numeric characters except decimal point
    const numStr = currencyStr.toString().replace(/[^0-9.]/g, '');
    const value = parseFloat(numStr);
    return isNaN(value) ? 0 : value;
  };

  // Format number to currency display
  const formatCurrency = (amount) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toFixed(0);
  };

  // Check if two dates are the same day
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;

    // Normalize both dates to YYYY-MM-DD format for comparison
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEarnings(true);
  }, []);

  // Function to fetch earnings data
  const fetchEarnings = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }

      // Get the host ID from AsyncStorage
      const hostId = await AsyncStorage.getItem('uid');
      if (!hostId) {
        setError('Unable to identify host. Please log in again.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch earnings data with timestamp to avoid caching
      const response = await apiInstance.get(`/earnings/host/${hostId}?t=${Date.now()}`);
      const data = response.data;

      if (data && data.success) {
        setEarningsData(data);
        setHostName(data.hostName || '');

        // Fetch activities data for bookings directly from Firebase structure
        if (data.recentBookings && data.recentBookings.length > 0) {
          try {
            // Get unique activity IDs from bookings
            const activityIds = [...new Set(data.recentBookings
              .filter(booking => booking && booking.activityId)
              .map(booking => booking.activityId))];

            console.log("[Earnings] Activity IDs to fetch:", activityIds);

            if (activityIds.length === 0) {
              console.log("[Earnings] No activity IDs found in bookings");
              return;
            }

            // First attempt: Try fetching all activities at once
            try {
              console.log("[Earnings] Attempting to fetch all activities");
              const activitiesResponse = await apiInstance.get('/allActivities');
              console.log("[Earnings] Activities response status:", activitiesResponse.status);

              if (activitiesResponse.data && activitiesResponse.data.success) {
                const allActivities = activitiesResponse.data.data || {};
                const activitiesObj = {};

                // Match the activities needed for our bookings
                let foundCount = 0;
                activityIds.forEach(activityId => {
                  if (allActivities[activityId]) {
                    activitiesObj[activityId] = allActivities[activityId];
                    foundCount++;
                    console.log(`[Earnings] Found activity: ${activityId} - Title: ${allActivities[activityId].activityTitle || allActivities[activityId].title || 'No title'}`);
                  } else {
                    console.log(`[Earnings] Activity not found in all activities: ${activityId}`);
                  }
                });

                console.log(`[Earnings] Found ${foundCount} of ${activityIds.length} activities`);

                // If we found all activities, use this data
                if (foundCount === activityIds.length) {
                  setActivitiesData(activitiesObj);
                  return; // Exit early if we have all the data
                }

                // If we didn't find all activities, we'll continue to the individual fetch as fallback
                console.log("[Earnings] Some activities missing, will try individual fetching");
              } else {
                throw new Error("Unable to fetch all activities or response format incorrect");
              }
            } catch (allActivitiesError) {
              console.error("[Earnings] Error fetching all activities:", allActivitiesError);
              // Continue to individual fetch as fallback
            }

            // Second attempt: Fetch each activity individually (Enhanced with better error handling)
            console.log("[Earnings] Falling back to individual activity fetching");
            const activitiesObj = {};

            await Promise.all(activityIds.map(async (activityId) => {
              console.log(`[Earnings] Attempting to fetch individual activity: ${activityId}`);

              // Try multiple endpoints to get activity details
              const endpoints = [
                `/activity/${activityId}`,
                `/activityDetails/${activityId}`
              ];

              for (const endpoint of endpoints) {
                try {
                  console.log(`[Earnings] Trying endpoint: ${endpoint}`);
                  const activityResponse = await apiInstance.get(endpoint);

                  if (activityResponse.data && activityResponse.data.success && activityResponse.data.data) {
                    const activityData = activityResponse.data.data;
                    activitiesObj[activityId] = activityData;

                    // Log detailed info about the fetched activity
                    console.log(`[Earnings] Successfully fetched activity from ${endpoint}:`, {
                      id: activityId,
                      title: activityData.activityTitle || activityData.title || 'No title',
                      hasTitle: !!activityData.activityTitle,
                      hasAltTitle: !!activityData.title,
                      keys: Object.keys(activityData)
                    });

                    break; // Exit loop if successful
                  } else {
                    console.log(`[Earnings] Endpoint ${endpoint} returned success:false or no data`);
                  }
                } catch (innerError) {
                  console.log(`[Earnings] Failed to fetch from ${endpoint}:`, innerError.message);
                  // Continue to next endpoint
                }
              }

              // If we couldn't get the activity data, create a placeholder with the ID
              if (!activitiesObj[activityId]) {
                console.log(`[Earnings] Could not fetch activity ${activityId} from any endpoint, creating placeholder`);
                activitiesObj[activityId] = {
                  activityId: activityId,
                  activityTitle: `Activity ${activityId.substring(0, 8)}...`
                };
              }
            }));

            // Third attempt: If we still don't have activity titles, try to use titles from bookings
            data.recentBookings.forEach(booking => {
              const activityId = booking.activityId;
              if (activityId && activitiesObj[activityId] && !activitiesObj[activityId].activityTitle) {
                if (booking.activityTitle) {
                  console.log(`[Earnings] Using title from booking for activity ${activityId}: ${booking.activityTitle}`);
                  activitiesObj[activityId].activityTitle = booking.activityTitle;
                }
              }
            });

            console.log(`[Earnings] Final activitiesData object has ${Object.keys(activitiesObj).length} activities`);
            setActivitiesData(activitiesObj);
          } catch (activitiesError) {
            console.error("[Earnings] Error in activity fetch process:", activitiesError);
          }
        }

        setError(null);
      } else {
        throw new Error(data.error || 'Failed to load earnings data');
      }
    } catch (error) {
      console.error('[Earnings] Error fetching earnings data:', error);
      setError(error.message || 'Failed to fetch earnings data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch earnings data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchEarnings();
    }, [])
  );

  // Helper function to return empty chart data
  const getEmptyChartData = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 3;
    const yearLabels = [];
    
    // Create array of years from startYear to currentYear + 3
    for (let year = startYear; year <= currentYear + 3; year++) {
      yearLabels.push(year.toString());
    }
    
    return {
      weeklyData: {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0], color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, strokeWidth: 3 }]
      },
      monthlyData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, strokeWidth: 3 }]
      },
      yearlyData: {
        labels: yearLabels,
        datasets: [{ data: Array(yearLabels.length).fill(0), color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, strokeWidth: 3 }]
      }
    };
  };

  // Prepare chart data based on fetched earnings
  const prepareChartData = () => {
    if (!earningsData) {
      // Default data if no earnings data yet
      return getEmptyChartData();
    }

    // Check if there are any earnings at all
    const hasAnyEarnings = 
      parseCurrency(earningsData.totalEarnings || '0') > 0 || 
      parseCurrency(earningsData.weeklyEarnings || '0') > 0 || 
      parseCurrency(earningsData.yearlyEarnings || '0') > 0 || 
      (earningsData.monthlyEarnings && Object.values(earningsData.monthlyEarnings).some(val => parseCurrency(val) > 0));

    // If no earnings at all, return all zeros
    if (!hasAnyEarnings && (!earningsData.recentBookings || earningsData.recentBookings.length === 0)) {
      console.log("[Earnings] User has zero earnings - showing empty/flat chart");
      return getEmptyChartData();
    }

    console.log("[Earnings] Preparing chart data...");

    // --------- WEEKLY DATA PROCESSING ---------
    // Weekly data - Initialize with zeros for each day
    const weeklyData = [0, 0, 0, 0, 0, 0, 0]; // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]

    // Process recent bookings for weekly data
    if (earningsData.recentBookings && earningsData.recentBookings.length > 0) {
      // Calculate start of last week (7 days ago from today)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      console.log(`[Earnings] Processing weekly data - Last week starts: ${lastWeek.toISOString()}`);

      // Track how many bookings we process for weekly data
      let processedWeeklyBookings = 0;

      earningsData.recentBookings.forEach((booking, index) => {
        try {
          // Try multiple date fields with robust parsing
          let bookingDateStr = booking.createdAt || booking.bookingDate;
          if (!bookingDateStr) {
            console.log(`[Earnings] Booking #${index} has no date information, skipping for weekly data`);
            return;
          }

          // Parse the date with better error handling
          let bookingDate;
          try {
            // Handle different date formats
            if (typeof bookingDateStr === 'string' && bookingDateStr.includes('T')) {
              // ISO format
              bookingDate = new Date(bookingDateStr);
            } else if (typeof bookingDateStr === 'string' && bookingDateStr.includes('-')) {
              // YYYY-MM-DD format
              const [year, month, day] = bookingDateStr.split('-').map(n => parseInt(n, 10));
              bookingDate = new Date(year, month - 1, day);
            } else {
              // Generic parsing
              bookingDate = new Date(bookingDateStr);
            }

            // Validate the date is valid
            if (isNaN(bookingDate.getTime())) {
              throw new Error(`Invalid date: ${bookingDateStr}`);
            }
          } catch (dateError) {
            console.error(`[Earnings] Error parsing booking date '${bookingDateStr}':`, dateError);
            return;
          }

          // Check if booking is within the last week
          if (bookingDate >= lastWeek) {
            const day = bookingDate.getDay(); // 0 = Sunday

            // Get the payment amount with better error handling
            let amount = 0;
            if (booking.hostEarnings) {
              amount = parseCurrency(booking.hostEarnings);
            } else if (booking.paymentAmount) {
              amount = parseCurrency(booking.paymentAmount) * 0.8; // 80% for host
            }

            if (amount > 0) {
              weeklyData[day] += amount;
              processedWeeklyBookings++;
              console.log(`[Earnings] Added ${amount} to day ${day} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]}) - Total: ${weeklyData[day]}`);
            }
          }
        } catch (e) {
          console.error(`[Earnings] Error processing booking #${index} for weekly data:`, e);
        }
      });

      console.log(`[Earnings] Processed ${processedWeeklyBookings} bookings for weekly data. Final data:`, weeklyData);
    }

    // Ensure we have at least some minimal values for the chart to look nice
    // This will make small values more visible
    const hasWeeklyData = weeklyData.some(val => val > 0);
    if (hasWeeklyData) {
      // Find the max value to normalize the chart better
      const maxWeeklyValue = Math.max(...weeklyData);
      if (maxWeeklyValue > 0) {
        // Ensure all non-zero values are at least 5% visible for better visualization
        weeklyData.forEach((val, i) => {
          if (val > 0 && val < maxWeeklyValue * 0.05) {
            weeklyData[i] = maxWeeklyValue * 0.05;
          }
        });
      }
    } else {
      // If no data at all, keep zeros - don't add placeholder data
      console.log("[Earnings] No weekly data found, keeping zeros");
    }

    // --------- MONTHLY DATA PROCESSING ---------
    // Monthly data - always show all months in chronological order from Jan to Dec
    const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyValues = new Array(12).fill(0);

    // Process monthly earnings data from the API
    if (earningsData.monthlyEarnings) {
      Object.entries(earningsData.monthlyEarnings).forEach(([month, value]) => {
        const monthIndex = allMonths.indexOf(month);
        if (monthIndex !== -1) {
          monthlyValues[monthIndex] = parseCurrency(value);
        }
      });
    }

    // --------- YEARLY DATA PROCESSING ---------
    // Yearly data - include past years even without bookings, but NO future projections
    const currentYear = new Date().getFullYear();
    const yearlyLabels = [];
    const yearlyValues = [];

    // Process booking data to calculate earnings by year
    if (earningsData.recentBookings && earningsData.recentBookings.length > 0) {
      // Group bookings by year
      const earningsByYear = {};

      // For logging purposes
      console.log("[Earnings] Processing bookings for yearly data:", earningsData.recentBookings.length);

      earningsData.recentBookings.forEach(booking => {
        try {
          if (!booking.createdAt && !booking.bookingDate) return;

          const bookingDate = new Date(booking.createdAt || booking.bookingDate);

          // Validate date
          if (isNaN(bookingDate.getTime())) {
            console.log(`[Earnings] Invalid booking date: ${booking.createdAt || booking.bookingDate}`);
            return;
          }

          const year = bookingDate.getFullYear();

          if (!earningsByYear[year]) {
            earningsByYear[year] = 0;
          }

          const bookingAmount = parseCurrency(booking.hostEarnings || booking.paymentAmount * 0.8 || 0);
          earningsByYear[year] += bookingAmount;

          console.log(`[Earnings] Booking in ${year}, amount: ${bookingAmount}, total: ${earningsByYear[year]}`);
        } catch (e) {
          console.error("[Earnings] Error processing booking date:", e);
        }
      });

      console.log("[Earnings] Years with earnings data:", earningsByYear);

      // Get current year earnings - use API data if available, otherwise use calculated data
      const currentYearEarnings = parseCurrency(earningsData.yearlyEarnings || '0');

      // Create array of recent years (past 3 years through current year + 3 future years)
      const startYear = currentYear - 3; // Show 3 years of history

      // Generate yearly data points for past, current, and future years
      for (let year = startYear; year <= currentYear + 3; year++) {
        yearlyLabels.push(year.toString());

        if (year === currentYear) {
          // For current year, use the yearly earnings from API or calculated data
          yearlyValues.push(Math.max(currentYearEarnings, earningsByYear[year] || 0));
        }
        else if (year < currentYear) {
          // For past years, use actual data or zero for years with no earnings
          const pastYearValue = earningsByYear[year] || 0;

          // If we have any data for this year, use it
          if (pastYearValue > 0) {
            yearlyValues.push(pastYearValue);
          } else {
            // For years with zero data, use actual zero
            yearlyValues.push(0);
          }
        }
        else {
          // For future years, use zero - NO projections
          yearlyValues.push(0);
          console.log(`[Earnings] Setting future year ${year} to zero (no projection)`);
        }
      }
    } else {
      // No booking data at all
      const startYear = currentYear - 3; // Show 3 years of history

      // Get current year earnings from API data
      const currentYearEarnings = parseCurrency(earningsData.yearlyEarnings || '0');

      for (let year = startYear; year <= currentYear + 3; year++) {
        yearlyLabels.push(year.toString());

        if (year === currentYear) {
          // Use the yearly earnings from API for current year
          yearlyValues.push(currentYearEarnings > 0 ? currentYearEarnings : 0);
        }
        else {
          // All other years (past and future) use zero
          yearlyValues.push(0);
        }
      }

      console.log("[Earnings] Generated yearly data with no bookings (flat line)");
    }

    // Ensure we have valid values - handle any potential NaN or Infinity
    yearlyValues.forEach((val, i) => {
      if (isNaN(val) || !isFinite(val) || val < 0) {
        console.log(`[Earnings] Fixed invalid yearly value at index ${i}: ${val}`);
        yearlyValues[i] = 0;
      }
    });

    // Return the final data object for all time periods
    return {
      weeklyData: {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
          data: weeklyData,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          strokeWidth: 3
        }]
      },
      monthlyData: {
        labels: allMonths,
        datasets: [{
          data: monthlyValues,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          strokeWidth: 3
        }]
      },
      yearlyData: {
        labels: yearlyLabels,
        datasets: [{
          data: yearlyValues,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          strokeWidth: 3
        }]
      }
    };
  };

  // Simplify getData function - remove normalization step as it's no longer needed
  const getData = () => {
    const { weeklyData, monthlyData, yearlyData } = prepareChartData();

    switch (activeTab) {
      case 'Weekly':
        return weeklyData;
      case 'Monthly':
        return monthlyData;
      case 'Yearly':
        return yearlyData;
      default:
        return monthlyData;
    }
  };

  // Get today's sales and order totals
  const getTodaySales = () => {
    if (!earningsData || !earningsData.recentBookings || !Array.isArray(earningsData.recentBookings)) {
      console.log("[Earnings] No recent bookings data available");
      return { sales: 0, orders: 0 };
    }

    const today = new Date(); // Today's date
    let totalSales = 0;
    let orderCount = 0;

    try {
      // Filter bookings from today with more robust date handling
      const todayBookings = earningsData.recentBookings.filter(booking => {
        if (!booking) return false;

        try {
          // Try different date fields in the booking
          const bookingDateStr = booking.createdAt || booking.bookingDate;
          if (!bookingDateStr) return false;

          // Handle various date formats
          let bookingDate;

          // If it's already a Date object
          if (bookingDateStr instanceof Date) {
            bookingDate = bookingDateStr;
          }
          // For ISO format with T (e.g., "2025-03-18T12:34:56.789Z")
          else if (typeof bookingDateStr === 'string' && bookingDateStr.includes('T')) {
            bookingDate = new Date(bookingDateStr);
          }
          // For "YYYY-MM-DD" format
          else if (typeof bookingDateStr === 'string' && bookingDateStr.includes('-')) {
            const [year, month, day] = bookingDateStr.split('-').map(num => parseInt(num, 10));
            bookingDate = new Date(year, month - 1, day); // month is 0-indexed in JS Date
          }
          // Default parsing
          else {
            bookingDate = new Date(bookingDateStr);
          }

          // Check if booking date is today
          return isSameDay(bookingDate, today);
        } catch (e) {
          console.error("[Earnings] Error parsing booking date:", e);
          return false;
        }
      });

      // Calculate total sales
      totalSales = todayBookings.reduce((sum, booking) => {
        const amount = parseCurrency(booking.hostEarnings || booking.paymentAmount * 0.8 || 0);
        return sum + amount;
      }, 0);

      orderCount = todayBookings.length;

      console.log(`[Earnings] Found ${orderCount} orders today with total sales of ${totalSales}`);
    } catch (error) {
      console.error("[Earnings] Error calculating today's sales:", error);
    }

    return {
      sales: totalSales,
      orders: orderCount
    };
  };

  // Width for the scrollable chart
  const chartWidth = activeTab === 'Monthly' ? screenWidth * 1.8 :
    activeTab === 'Yearly' ? screenWidth * 1.5 :
      screenWidth * 1.8;

  // Get total earnings for currently selected period
  const getDisplayEarnings = () => {
    if (!earningsData) return '0';

    switch (activeTab) {
      case 'Weekly':
        return formatCurrency(parseCurrency(earningsData.weeklyEarnings || '0'));
      case 'Monthly':
        const currentMonth = new Date().toLocaleString('default', { month: 'short' });
        return formatCurrency(parseCurrency(earningsData.monthlyEarnings?.[currentMonth] || '0'));
      case 'Yearly':
        return formatCurrency(parseCurrency(earningsData.yearlyEarnings || '0'));
      default:
        return formatCurrency(parseCurrency(earningsData.totalEarnings || '0'));
    }
  };

  // Get today's sales metrics
  const todaySales = getTodaySales();

  // Show loading indicator
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5A5F" />
          <Text style={styles.loadingText}>Loading your Earnings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if data couldn't be loaded
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to load earnings</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => setLoading(true)} // This will retrigger useFocusEffect
          >
            <Text style={styles.errorButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View style={styles.content}>
          <Text style={styles.title}>Earnings</Text>

          {/* Tab Selection */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'Weekly' ? styles.activeTab : styles.inactiveTab
              ]}
              onPress={() => setActiveTab('Weekly')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'Weekly' ? styles.activeTabText : styles.inactiveTabText
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'Monthly' ? styles.activeTab : styles.inactiveTab
              ]}
              onPress={() => setActiveTab('Monthly')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'Monthly' ? styles.activeTabText : styles.inactiveTabText
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'Yearly' ? styles.activeTab : styles.inactiveTab
              ]}
              onPress={() => setActiveTab('Yearly')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'Yearly' ? styles.activeTabText : styles.inactiveTabText
                ]}
              >
                Yearly
              </Text>
            </TouchableOpacity>
          </View>

          {/* Current Earnings Display */}
          <View style={styles.currentEarningsContainer}>
            <Text style={styles.currentEarningsLabel}>
              {activeTab === 'Weekly' ? 'This Week' :
                activeTab === 'Monthly' ? `This Month` :
                  activeTab === 'Yearly' ? `This Year (${new Date().getFullYear()})` :
                    'Total Earnings'}
            </Text>
            <Text style={styles.currentEarningsAmount}>Rs. {getDisplayEarnings()}</Text>
          </View>

          {/* Scrollable Chart Container */}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartScrollContainer}
          >
            <LineChart
              data={getData()}
              width={chartWidth}
              height={280}
              yAxisSuffix=""
              yAxisLabel="Rs. "
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Dark black labels
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '0', // No dots
                  strokeWidth: '0',
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: '#f0f0f0',
                  strokeWidth: 1
                },
                fillShadowGradient: 'rgba(0, 0, 0, 0)', // No gradient fill
                fillShadowGradientOpacity: 0,
              }}
              withShadow={false}
              bezier
              style={styles.chart}
              withVerticalLines={true}
              withHorizontalLines={false}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={true}
              formatYLabel={(value) => {
                // Format for all chart types consistently (weekly, monthly, yearly)
                if (value === '0') return '0';
                // Convert to thousands (k) format for all values over 1000
                if (parseFloat(value) >= 1000) {
                  return `${(parseFloat(value) / 1000).toFixed(1)}k`;
                }
                // For smaller values use predefined increments when possible
                if (value === '200') return '200';
                if (value === '400') return '400';
                if (value === '600') return '600';
                if (value === '800') return '800';
                return `${value}`;
              }}
            />
          </ScrollView>

          {/* Today's Sales Section */}
          <View style={styles.salesContainer}>
            <Text style={styles.secondtitle}>Today's Sales</Text>
            <View style={styles.cardRow}>
              <View style={[styles.card, { backgroundColor: 'white', borderColor: '#FF5A5F', borderWidth: 1 }]}>
                <Image source={salesIcons.totalSales} style={styles.cardIcon} />
                <Text style={styles.cardValue}>Rs. {formatCurrency(todaySales.sales)}</Text>
                <Text style={styles.cardLabel}>Total Sales</Text>
              </View>
              <View style={[styles.card, { backgroundColor: 'white', borderColor: '#FF5A5F', borderWidth: 1 }]}>
                <Image source={salesIcons.totalOrder} style={styles.cardIcon} />
                <Text style={styles.cardValue}>{todaySales.orders}</Text>
                <Text style={styles.cardLabel}>Total Orders</Text>
              </View>
            </View>
          </View>

          {/* Recent Bookings Section */}
          {earningsData && earningsData.recentBookings && earningsData.recentBookings.length > 0 && (
            <View style={styles.recentBookingsContainer}>
              <Text style={styles.secondtitle}>Recent Bookings</Text>
              {earningsData.recentBookings.slice(0, 5).map((booking) => {
                // Log the activity details for debugging
                const activityId = booking.activityId;
                console.log(`[Earnings] Rendering booking for activity: ${activityId}`);
                console.log(`[Earnings] Booking data:`, booking);
                console.log(`[Earnings] Activity data available:`, activitiesData[activityId]);

                // Get activity title with multiple fallbacks
                let activityTitle = 'Activity';

                // IMPROVED: Check all possible locations for the activity title
                // First priority: Check in the booking object directly
                if (booking.activityTitle) {
                  activityTitle = booking.activityTitle;
                  console.log(`[Earnings] Using title from booking object: ${activityTitle}`);
                }
                // Second priority: Check in activitiesData
                else if (activitiesData[activityId] && activitiesData[activityId].activityTitle) {
                  activityTitle = activitiesData[activityId].activityTitle;
                  console.log(`[Earnings] Using title from activities data: ${activityTitle}`);
                }
                // Third priority: Try other possible field names
                else if (activitiesData[activityId] && activitiesData[activityId].title) {
                  activityTitle = activitiesData[activityId].title;
                  console.log(`[Earnings] Using title field from activities data: ${activityTitle}`);
                }
                // Last resort - use ID or default
                else {
                  console.log(`[Earnings] No title found for activity ${activityId}, using default`);
                  activityTitle = `Activity ${activityId.substring(0, 8)}...`;
                }

                return (
                  <View key={booking.bookingId || Math.random().toString()} style={styles.bookingCard}>
                    <View style={styles.bookingHeader}>
                      <Text style={styles.bookingTitle}>{activityTitle}</Text>
                      <Text style={styles.bookingAmount}>{booking.hostEarnings}</Text>
                    </View>
                    <View style={styles.bookingDetails}>
                      <Text style={styles.bookingInfo}>
                        {booking.bookingDate || 'Date not available'} • {booking.requestedGuests || 1} {booking.requestedGuests === 1 ? 'Guest' : 'Guests'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  title: {
    fontSize: 38,
    fontWeight: '600',
    color: 'black',
    textAlign: 'left',
    marginLeft: 14,
    marginTop: 51,
    marginBottom: 16,
    letterSpacing: 0.6,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    alignSelf: 'center',
    marginTop: 25
  },
  tab: {
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 7,
  },
  activeTab: {
    backgroundColor: '#FF5A5F', // Airbnb color
  },
  inactiveTab: {
    backgroundColor: '#f1f1f1', // Light gray for inactive tabs
  },
  tabText: {
    fontWeight: '500',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },
  inactiveTabText: {
    color: '#777',
  },
  currentEarningsContainer: {
    marginBottom: 20,
    alignItems: 'center'
  },
  currentEarningsLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8
  },
  currentEarningsAmount: {
    paddingLeft:30,
    fontSize: 28,
    fontWeight: '700',
    color: '#FF5A5F',
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },
  chartScrollContainer: {
    paddingRight: 16,
  },
  salesContainer: {
    marginTop: 20,
    marginBottom: 35,
  },
  secondtitle: {
    fontSize: 28,
    fontWeight: '600',
    color: 'black',
    textAlign: 'left',
    marginLeft: 14,
    marginBottom: 35,
    letterSpacing: 0.6,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 16,
    marginRight: 16,
  },
  card: {
    width: '48%',
    padding: 16,
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  cardIcon: {
    width: 38,  // Adjust size as needed
    height: 38, // Adjust size as needed
    marginBottom: 18,
    resizeMode: 'contain', // This ensures the image fits within the specified dimensions
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '600'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#FF5A5F',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#FF5A5F',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  recentBookingsContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FF5A5F',
    marginHorizontal: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  bookingAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: 'black',
  },
  bookingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingInfo: {
    fontSize: 14,
    color: '#666',
  },
});

export default Earnings;
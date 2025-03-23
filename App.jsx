// App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Alert, StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StripeProvider } from '@stripe/stripe-react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import ErrorBoundary from './src/components/ErrorBoundary';
import NetInfo from '@react-native-community/netinfo';
import OfflineFallback from './src/components/OfflineFallback ';
import { initializeNotifications } from './src/utils/notificationService';


// Import your screen components
import ActivityInformationScreen from './src/screens/ActivityInformationScreen';
import LocationInformationScreen from './src/screens/LocationInformationScreen';
import ScheduleInformationScreen from './src/screens/ScheduleInformationScreen';
import ParticipantsInformationScreen from './src/screens/ParticipantsInformationScreen';
import PriceInformationScreen from './src/screens/PriceInformationScreen';
import ImagesInformationScreen from './src/screens/ImagesInformationScreen';
import HostInformationScreen from './src/screens/HostInformationScreen';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import HostTabs from './src/navigations/HostTabs';
import PersonalInfo from './src/screens/PersonalInfo';
import HostPersonalInfo from './src/screens/HostPersonalInfo';
import ActivityDetails from './src/screens/ActivityDetails';
import HostActivityDetails from './src/screens/HostActivityDetails';
import ConfirmAndPay from './src/screens/ConfirmAndPay';
import AvailabilityScheduleDetails from './src/screens/ScheduleAvailabilityDetails';
import Earnings from './src/screens/Earnings';
import AfterSearch from './src/screens/AfterSearch';
import UserTabs from './src/navigations/UserTabs';
import SearchScreen from './src/screens/SearchScreen';
import FinishHostFormScreen from './src/screens/FinishHostFormScreen';
import CertificateViewer from './src/screens/CertificateViewer';
import OTPVerification from './src/screens/OTPVerification';
import AuthLoading from './src/screens/AuthLoading';
import { WishlistProvider } from './src/contexts/WishlistContext';
import FeedbackScreen from './src/screens/FeedbackScreen';
import BookingConfirmed from './src/screens/BookingConfirmed';



const Stack = createNativeStackNavigator();


// A simple Toast component to display minimalistic messages
const Toast = ({ message }) => (
  <View style={toastStyles.container}>
    <Text style={toastStyles.text}>{message}</Text>
  </View>
);


const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    zIndex: 999, // Ensure it's above other components
  },
  text: {
    color: '#fff',
    fontSize: 14,
  },
});


export default function App() {
  const [isOffline, setIsOffline] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navigationRef = useRef(null);
 
  // Add this navigation helper function
  const navigate = (name, params) => {
    if (navigationRef.current) {
      navigationRef.current.navigate(name, params);
    } else {
      // Retry navigation if navigator isn't ready yet
      setTimeout(() => {
        if (navigationRef.current) {
          navigationRef.current.navigate(name, params);
        } else {
          // One more retry with longer delay
          setTimeout(() => {
            if (navigationRef.current) {
              navigationRef.current.navigate(name, params);
            }
          }, 3000);
        }
      }, 1000); // Initial delay to allow navigation to initialize
    }
  };


  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return () => {
      unsubscribe();
    };
  }, []);


  // Retry function for OfflineFallback's "Retry" button
  const handleRetry = () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        setIsOffline(false);
        setToastMessage('');
      } else {
        // Show a minimalistic toast message if still offline
        setToastMessage('No internet connection. Please check and try again.');
        // Automatically clear the toast after 3 seconds
        setTimeout(() => {
          setToastMessage('');
        }, 3000);
      }
    });
  };


  // Configure Google Sign-In
  useEffect(() => {
    const configureGoogleSignIn = async () => {
      try {
        // Check for Google Play Services
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });


        // Configure Google Sign-In with correct web client ID
        GoogleSignin.configure({
          webClientId: '742417803218-r9sqso76qti6iqdkhsgfpj976408105o.apps.googleusercontent.com',
          offlineAccess: false,
        });


        if (__DEV__) {
          console.log('Google Sign-In configured successfully');
        }
      } catch (error) {
        console.error('Google Sign-In configuration error:', error);
      }
    };


    configureGoogleSignIn();


    // Global error handler
    const globalErrorHandler = (error, isFatal) => {
      console.error('Global Error:', error);
      Alert.alert(
        'Unexpected error occurred',
        'An unexpected error occurred. Please restart the app.',
        [{ text: 'OK' }]
      );
    };


    if (ErrorUtils && ErrorUtils.setGlobalHandler) {
      ErrorUtils.setGlobalHandler(globalErrorHandler);
    }
  }, []);
 
  // Initialize notifications
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Handle notification opened (navigation logic)
        const handleNotificationOpen = (remoteMessage) => {
          if (!remoteMessage) return;
         
          console.log('Notification opened:', remoteMessage);
         
          // Handle navigation based on notification type
          if (remoteMessage.data?.type === 'FEEDBACK_REMINDER') {
            const activityId = remoteMessage.data.activityId;
           
            if (activityId) {
              // Use the navigate helper instead of direct navigation
              navigate('FeedbackScreen', { activityId });
            }
          }
        };
       
        // Initialize notifications and store unsubscribe function
        const unsubscribe = await initializeNotifications(handleNotificationOpen);
       
        // Clean up on unmount
        return () => {
          if (unsubscribe) {
            unsubscribe();
          }
        };
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };
   
    setupNotifications();
  }, []); // Empty dependency array to run once on mount




  return (
    <StripeProvider
      publishableKey="pk_test_51QJngRAXKqdW343ZTbqZbwyg0a7oCTH1HEJKLsWOoodI7YYwjKfiUGfX5zX0lo10Y0sCl2oD8WS37K47jvfw863I007Uhcolkg"
      merchantIdentifier="merchant.com.yourapp"
    >
      <WishlistProvider>
        <ErrorBoundary>
          {isOffline ? (
            <OfflineFallback onRetry={handleRetry} />
          ) : (
            <NavigationContainer ref={navigationRef}>
              <Stack.Navigator
                initialRouteName="AuthLoading"
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name="AuthLoading" component={AuthLoading} />
                <Stack.Screen
                  name="ActivityInformationScreen"
                  component={ActivityInformationScreen}
                />
                <Stack.Screen
                  name="LocationInformationScreen"
                  component={LocationInformationScreen}
                />
                <Stack.Screen
                  name="ScheduleInformationScreen"
                  component={ScheduleInformationScreen}
                />
                <Stack.Screen
                  name="ParticipantsInformationScreen"
                  component={ParticipantsInformationScreen}
                />
                <Stack.Screen
                  name="PriceInformationScreen"
                  component={PriceInformationScreen}
                />
                <Stack.Screen
                  name="ImagesInformationScreen"
                  component={ImagesInformationScreen}
                />
                <Stack.Screen
                  name="HostInformationScreen"
                  component={HostInformationScreen}
                />
                <Stack.Screen name="UserTabs" component={UserTabs} />
                <Stack.Screen name="AfterSearch" component={AfterSearch} />
                <Stack.Screen name="Earnings" component={Earnings} />
                <Stack.Screen
                  name="AvailabilityScheduleDetails"
                  component={AvailabilityScheduleDetails}
                />
                <Stack.Screen
                  name="ActivityDetails"
                  component={ActivityDetails}
                />
                <Stack.Screen
                  name="OTPVerification"
                  component={OTPVerification}
                />
                <Stack.Screen
                  name="HostActivityDetails"
                  component={HostActivityDetails}
                />
                <Stack.Screen
                  name="ConfirmAndPay"
                  component={ConfirmAndPay}
                />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Signup" component={Signup} />
                <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
                <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
                <Stack.Screen name="HostTabs" component={HostTabs} />
                <Stack.Screen
                  name="HostPersonalInfo"
                  component={HostPersonalInfo}
                />
                <Stack.Screen name="SearchScreen" component={SearchScreen} />
                <Stack.Screen
                  name="FinishHostFormScreen"
                  component={FinishHostFormScreen}
                />
                <Stack.Screen
                  name="CertificateViewer"
                  component={CertificateViewer}
                  options={{ headerShown: true, title: 'Certificate' }}
                />
                <Stack.Screen
                  name="BookingConfirmed"
                  component={BookingConfirmed}
                />
              </Stack.Navigator>
            </NavigationContainer>
          )}
          {/* Render Toast message overlay if needed */}
          {toastMessage !== '' && <Toast message={toastMessage} />}
        </ErrorBoundary>
      </WishlistProvider>
    </StripeProvider>
  );
}

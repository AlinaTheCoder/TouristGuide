// App.jsx
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Alert, StyleSheet, View, Text, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StripeProvider } from '@stripe/stripe-react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import ErrorBoundary from './src/components/ErrorBoundary';
import NetInfo from '@react-native-community/netinfo';
import OfflineFallback from './src/components/OfflineFallback ';

// Import your app icon
import appIcon from './src/icons/app_icon.png'; // Make sure this path is correct

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

// Create toast context
const ToastContext = createContext({
  showSuccess: () => {},
});

// Enhanced Toast component with type support
const Toast = ({ message, type = 'default' }) => {
  // Show icon only for success type
  const showIcon = type === 'success';
  
  return (
    <View style={toastStyles.container}>
      {showIcon && <Image source={appIcon} style={toastStyles.icon} />}
      <Text style={toastStyles.text}>{message}</Text>
    </View>
  );
};

// Toast styles - updated to support icon and match your requirements
const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40, 
    left: '25%',
    right: '25%',
    backgroundColor: '#FFFFFF', 
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    borderWidth: 1, // Added border width
    borderColor: '#000000', // Added black border
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  text: {
    color: '#000000',
    fontSize: 14,
  },
});

// Toast global reference for non-component access
let toastGlobalRef = {
  showSuccess: () => {},
};

export const showSuccessToast = (message) => {
  toastGlobalRef.showSuccess(message);
};

// Toast Provider component
export const ToastProvider = ({ children }) => {
  const [toastConfig, setToastConfig] = useState({
    message: '',
    type: 'default',
    visible: false,
  });

  // Method to show toast of any type
  const showToast = (message, type, duration = 3000) => {
    setToastConfig({ message, type, visible: true });
    
    // Auto hide after duration
    setTimeout(() => {
      setToastConfig(prev => ({ ...prev, visible: false }));
    }, duration);
  };

  // Method specifically for success toasts
  const showSuccess = (message) => {
    showToast(message, 'success');
  };

  // Set the global reference
  useEffect(() => {
    toastGlobalRef = { showSuccess };
  }, []);

  return (
    <ToastContext.Provider value={{ showSuccess }}>
      {children}
      {toastConfig.visible && <Toast message={toastConfig.message} type={toastConfig.type} />}
    </ToastContext.Provider>
  );
};

// Hook for component usage
export const useToast = () => useContext(ToastContext);

export default function App() {
  const [isOffline, setIsOffline] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navigationRef = useRef(null);
 
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
 
  return (
    <ToastProvider>
      <StripeProvider
        publishableKey="pk_test_51R9lRbPYsnzTI5wKmo2Og7zpR57NoPtDgXMxLl3FZIJFpY6f9fl2Irwc7FJ1VxtK24Jy1bqVIjwA8ZNSXwrOxhjY00J6Fy9xbW"
        merchantIdentifier="merchant.com.yourapp"
      >
        <WishlistProvider>
          <ErrorBoundary>
            {isOffline ? (
              <OfflineFallback onRetry={handleRetry} />
            ) : (
              <NavigationContainer>
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
            {/* Render original toast message overlay if needed */}
            {toastMessage !== '' && <Toast message={toastMessage} />}
          </ErrorBoundary>
        </WishlistProvider>
      </StripeProvider>
    </ToastProvider>
  );
}
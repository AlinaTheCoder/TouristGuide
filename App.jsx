// App.jsx
import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StripeProvider } from '@stripe/stripe-react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import ErrorBoundary from './src/components/ErrorBoundary';
import NetInfo from '@react-native-community/netinfo';
import OfflineFallback from './src/components/OfflineFallback ';

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

  // Monitor network connectivity (all hooks are called on every render)
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

  // Configure Google Sign-In and set a global error handler
  useEffect(() => {
    async function configureGoogleSignIn() {
      try {
        const hasPlayServices = await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
        if (hasPlayServices) {
          GoogleSignin.configure({
            offlineAccess: true,
            webClientId:
              '742417803218-r9sqso76qti6iqdkhsgfpj976408105o.apps.googleusercontent.com',
          });
        }
      } catch (error) {
        console.error('GoogleSignin configuration error:', error);
      }
    }
    configureGoogleSignIn();

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
    <StripeProvider
      publishableKey="pk_test_51QJngRAXKqdW343ZTbqZbwyg0a7oCTH1HEJKLsWOoodI7YYwjKfiUGfX5zX0lo10Y0sCl2oD8WS37K47jvfw863I007Uhcolkg"
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

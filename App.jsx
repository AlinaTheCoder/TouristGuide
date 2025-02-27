import React, { useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StripeProvider } from '@stripe/stripe-react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

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

export default function App() {
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
  }, []);

  return (
    <StripeProvider
      publishableKey="pk_test_51QJngRAXKqdW343ZTbqZbwyg0a7oCTH1HEJKLsWOoodI7YYwjKfiUGfX5zX0lo10Y0sCl2oD8WS37K47jvfw863I007Uhcolkg"
      merchantIdentifier="merchant.com.yourapp"
    >
      <WishlistProvider>
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
            <Stack.Screen name="ActivityDetails" component={ActivityDetails} />
            <Stack.Screen name="OTPVerification" component={OTPVerification} />
            <Stack.Screen
              name="HostActivityDetails"
              component={HostActivityDetails}
            />
            <Stack.Screen name="ConfirmAndPay" component={ConfirmAndPay} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
            <Stack.Screen name="HostTabs" component={HostTabs} />
            <Stack.Screen name="HostPersonalInfo" component={HostPersonalInfo} />
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
      </WishlistProvider>
    </StripeProvider>
  );
}

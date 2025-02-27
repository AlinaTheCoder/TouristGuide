import React from 'react';
import { Image, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Analytics from '../screens/Analytics1';
import Schedule from '../screens/Schedule1';
import Listings from '../screens/Listings1';
import HostProfile from '../screens/HostProfile';


const Tab = createBottomTabNavigator();

const HostTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          height: 80,
          backgroundColor: '#FFFFFF',
          paddingLeft: 10,
          paddingRight: 10,
          elevation: 10
        },
      }}
    >
      <Tab.Screen
        name="Analytics"
        component={Analytics}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', top: 22, width: 60 }}>
              <Image
                source={require('../icons/analytics.png')}
                resizeMode="contain"
                style={{
                  width: 26,
                  height: 26,
                  marginBottom: 4,
                  tintColor: focused ? '#E74C3C' : '#555'
                }}
              />
              <Text style={{ color: focused ? '#E74C3C' : '#555', fontSize: 13, marginTop: 3, letterSpacing: 0.5, }}>Analytics</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={Schedule}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', top: 22, width: 70 }}>
              <Image
                source={require('../icons/schedule.png')}
                resizeMode="contain"
                style={{
                  width: 26,
                  height: 26,
                  marginBottom: 4,
                  tintColor: focused ? '#E74C3C' : '#555'
                }}
              />
              <Text style={{ color: focused ? '#E74C3C' : '#555', fontSize: 13, marginTop: 3, letterSpacing: 0.5 }}>Schedule</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Listings"
        component={Listings}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', top: 23, width: 60 }}>
              <Image
                source={require('../icons/listings.png')}
                resizeMode="contain"
                style={{
                  width: 26,
                  height: 26,
                  marginBottom: 4,
                  tintColor: focused ? '#E74C3C' : '#555'
                }}
              />
              <Text style={{ color: focused ? '#E74C3C' : '#555', fontSize: 13, marginTop: 3, letterSpacing: 0.5 }}>Listings</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={HostProfile}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', top: 23, width: 60 }}>
              <Image
                source={require('../icons/user.png')}
                resizeMode="contain"
                style={{
                  width: 26,
                  height: 26,
                  marginBottom: 4,
                  tintColor: focused ? '#E74C3C' : '#555'
                }}
              />
              <Text style={{ color: focused ? '#E74C3C' : '#555', fontSize: 13, marginTop: 3, letterSpacing: 0.5 }}>Profile</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default HostTabs;


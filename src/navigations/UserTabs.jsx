import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Explore from "../screens/Explore";
import Wishlists from "../screens/Wishlists1";
import Trips from "../screens/Trips1";
import UserProfile from "../screens/UserProfile";
import { Text, View, Image } from "react-native";
// wait
const Tab = createBottomTabNavigator();

const UserTabs = () => {
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
                name="Explore"
                component={Explore}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center', top: 22, width: 60 }}>
                            <Image
                                source={require('../icons/search.png')}
                                resizeMode="contain"
                                style={{
                                    width: 26,
                                    height: 26,
                                    marginBottom: 4,
                                    tintColor: focused ? '#E74C3C' : '#555'
                                }}
                            />
                            <Text style={{ color: focused ? '#E74C3C' : '#555', fontSize: 13, marginTop: 3, letterSpacing: 0.5, }}>Explore</Text>
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Wishlists"
                component={Wishlists}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center', top: 22, width: 70 }}>
                            <Image
                                source={require('../icons/heart.png')}
                                resizeMode="contain"
                                style={{
                                    width: 26,
                                    height: 26,
                                    marginBottom: 4,
                                    tintColor: focused ? '#E74C3C' : '#555'
                                }}
                            />
                            <Text style={{ color: focused ? '#E74C3C' : '#555', fontSize: 13, marginTop: 3, letterSpacing: 0.5 }}>Wishlists</Text>
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Trips"
                component={Trips}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center', top: 23, width: 60 }}>
                            <Image
                                source={require('../icons/trips.png')}
                                resizeMode="contain"
                                style={{
                                    width: 26,
                                    height: 26,
                                    marginBottom: 4,
                                    tintColor: focused ? '#E74C3C' : '#555'
                                }}
                            />
                            <Text style={{ color: focused ? '#E74C3C' : '#555', fontSize: 13, marginTop: 3, letterSpacing: 0.5 }}>Trips</Text>
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="UserProfile"
                component={UserProfile}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center', top: 23, width: 60 }}>
                            <Image
                                source={require('../icons/profile.png')}
                                resizeMode="contain"
                                style={{
                                    width: 28,
                                    height: 28,
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

export default UserTabs;
import React, { useState, useEffect, useContext } from "react";  
import {  
  View,  
  FlatList,  
  Image,  
  StyleSheet,  
  Dimensions,  
  Text,  
  ScrollView,  
  TouchableOpacity,  
  ActivityIndicator,  
  Alert,  
} from "react-native";  
import { useNavigation, useRoute } from "@react-navigation/native";  
import apiInstance from "../config/apiConfig";  
import AsyncStorage from "@react-native-async-storage/async-storage";  
import { WishlistContext } from "../contexts/WishlistContext";  
import Feedbacks from "../components/Feedbacks";

const screenWidth = Dimensions.get("window").width;

const ActivityDetails = () => {  
  const navigation = useNavigation();  
  const route = useRoute();  
  const { activityId } = route.params;

  // Store the activity data from the server  
  const [activityData, setActivityData] = useState(null);  
  const [activeIndex, setActiveIndex] = useState(0);  
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [locationExpanded, setLocationExpanded] = useState(false);
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);

  // Access the user's wishlist from context  
  const { wishlistIds, toggleWishlist } = useContext(WishlistContext);

  // Local user ID (if needed, though you might not need it if using context)  
  const [userId, setUserId] = useState(null);  
  useEffect(() => {  
    const fetchUid = async () => {  
      try {  
        const uid = await AsyncStorage.getItem("uid");  
        console.log("Loaded UID:", uid);  
        setUserId(uid);  
      } catch (error) {  
        console.error("Error fetching UID:", error);  
      }  
    };  
    fetchUid();  
  }, []);

  // Fetch activity details  
  useEffect(() => {  
    const fetchActivityDetails = async () => {  
      try {  
        setLoading(true);  
        const response = await apiInstance.get(  
          `/activityDetails/${activityId}?includeLikedStatus=true`  
        );

        if (response.data.success) {  
          setActivityData(response.data.data);  
        } else {  
          throw new Error("Failed to fetch activity details");  
        }  
      } catch (err) {  
        console.error("Error fetching activity details:", err);

        // --- NEW: Distinguish Network vs Server error ---  
        if (!err.response) {  
          // No server response => likely network/offline issue  
          Alert.alert(  
            "Network Error",  
            "Unable to reach the server. Please check your internet connection and try again."  
          );  
        } else {  
          // Server responded but with some error  
          Alert.alert(  
            "Error",  
            err.response.data?.error ||  
            err.response.data?.message ||  
            err.message ||  
            "Failed to fetch activity details."  
          );  
        }
        setError(err.message);  
      } finally {  
        setLoading(false);  
      }  
    };

    fetchActivityDetails();  
  }, [activityId]);

  // Derive whether it's liked from your context  
  const isHeartSelected = !!wishlistIds[activityId];

  const toggleLike = async () => {  
    await toggleWishlist(activityId);  
  };

  const formatDate = (dateString) => {  
    const options = { month: "short", day: "numeric", year: "numeric" };  
    return new Date(dateString).toLocaleDateString("en-US", options);  
  };

  const formatTime = (timeString) => {  
    const options = { hour: "numeric", minute: "numeric", hour12: true };  
    return new Date(timeString).toLocaleTimeString("en-US", options).toUpperCase();  
  };

  const renderItem = ({ item }) => (  
    <View>  
      <View style={styles.imageContainer}>  
        <Image source={{ uri: item }} style={styles.image} />  
        <View style={styles.topIconsContainer}>  
          <TouchableOpacity  
            style={styles.iconButton}  
            onPress={() => navigation.navigate("UserTabs", { screen: "Explore" })}  
          >  
            <Image  
              source={require("../icons/BackArrow.png")}  
              style={styles.iconImage}  
            />  
          </TouchableOpacity>  
          {/* Heart toggles wishlist */}  
          <TouchableOpacity style={styles.iconButton} onPress={toggleLike}>  
            <Image  
              source={require("../icons/heart.png")}  
              style={[styles.iconImage, isHeartSelected && { tintColor: "red" }]}  
            />  
          </TouchableOpacity>  
        </View>  
        <View style={styles.overlay}>  
          <View style={styles.indicatorContainer}>  
            {activityData?.activityImages.map((_, i) => (  
              <View  
                key={i}  
                style={[  
                  styles.indicator,  
                  { backgroundColor: i === activeIndex ? "white" : "lightgray" },  
                  { height: i === activeIndex ? 12 : 8 },  
                  { width: i === activeIndex ? 12 : 8 },  
                  { marginVertical: i === activeIndex ? -1 : 0 },  
                  { borderRadius: i === activeIndex ? 6 : 4 },  
                ]}  
              />  
            ))}  
          </View>  
        </View>  
      </View>  
    </View>  
  );

  if (loading) {  
    return (  
      <View style={styles.loadingContainer}>  
        <ActivityIndicator size="large" color="#FF5A5F" />  
      </View>  
    );  
  }

  if (error || !activityData) {  
    return (  
      <View style={styles.container}>  
        <Text style={{ color: "red", fontSize: 16, textAlign: "center" }}>  
          Unable to load activity details  
        </Text>  
      </View>  
    );  
  }

  // Check if activity description has "Read more" option
  const activityHasReadMore = !activityExpanded && 
    activityData.activityDescription && 
    activityData.activityDescription.length > 100;
    
  // Check if location description has "Read more" option
  const locationHasReadMore = !locationExpanded && 
    activityData.locationDescription && 
    activityData.locationDescription.length > 100;
    
  // Check if location description exists
  const locationDescriptionExists = activityData.locationDescription && 
    activityData.locationDescription.trim() !== "";

  return (  
    <View style={styles.container}>  
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>  
        <View>  
          <FlatList  
            data={activityData.activityImages}  
            horizontal  
            pagingEnabled  
            showsHorizontalScrollIndicator={false}  
            onMomentumScrollEnd={(event) => {  
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);  
              setActiveIndex(index);  
            }}  
            renderItem={renderItem}  
            keyExtractor={(_, index) => index.toString()}  
          />  
        </View>

        <View>  
          <Text numberOfLines={2} style={styles.title}>  
            {activityData.activityTitle}  
          </Text>  
          <Text style={styles.subTitle}>  
            {activityData.address}, {activityData.city}  
          </Text>  
          <Text style={styles.subTitle}>  
            {`${formatDate(activityData.dateRange.startDate)} - ${formatDate(  
              activityData.dateRange.endDate  
            )}`}  
          </Text>  
          <Text style={styles.subTitle}>  
            {`${formatTime(activityData.startTime)} - ${formatTime(activityData.endTime)}`}  
          </Text>  
          <Text style={styles.subTitle}>{activityData.ageGroup}</Text>  
          <View style={styles.lineContainer}>  
            <View style={styles.horizontalLine} />  
          </View>  
          <View style={styles.hostingContainer}>  
            <View style={styles.titleWithIcon}>  
              <View style={styles.hostTextContainer}>  
                <Text style={styles.hostingTitle}>  
                  Hosted By {activityData.hostName}  
                </Text>  
                <Text style={styles.hostingSubTitle}>  
                  {activityData.duration} · Host in {activityData.language}  
                </Text>  
              </View>  
              <Image  
                source={{ uri: activityData.profileImage }}  
                style={styles.hostProfileImage}  
              />  
            </View>  
          </View>  
          <View style={styles.lineContainer}>  
            <View style={styles.horizontalLine} />  
          </View>  
        </View>

        {/* Special Sections - Review */}  
        <Feedbacks activityId={activityId} />  
        <View style={styles.lineContainer}>  
          <View style={styles.horizontalLine} />  
        </View>

        {/* Activity Description */}  
        <View style={[
          styles.descriptionContainer,
          // Only reduce padding when "Read more" is showing AND location description exists
          (activityHasReadMore && locationDescriptionExists) ? { paddingBottom: 0 } : { paddingBottom: 18 }
        ]}>  
          <Text style={styles.descriptionHeader}>What You'll Enjoy?</Text>  
          <Text style={styles.descriptionText}>  
            {activityExpanded  
              ? activityData.activityDescription || "No activity description provided"  
              : `${(activityData.activityDescription || "No activity description provided").slice(  
                0,  
                100  
              )}`}  
            {activityHasReadMore && (  
              <Text style={styles.readMore} onPress={() => setActivityExpanded(true)}>  
                {" "}  
                Read more  
              </Text>  
            )}  
          </Text>  
        </View>

        {/* Location Description */}  
        {locationDescriptionExists ? (  
          <>  
            <View style={styles.lineContainer2}>  
              <View style={styles.horizontalLine2} />  
            </View>

            <View style={[
              styles.descriptionContainer2,
              // Keep standard padding even when "Read more" is showing
              { paddingBottom: 18 }
            ]}>  
              <Text style={styles.descriptionHeader}>  
                Why Is This Location Significant?  
              </Text>  
              <Text style={styles.descriptionText}>  
                {locationExpanded  
                  ? activityData.locationDescription  
                  : `${activityData.locationDescription.slice(0, 100)}`}  
                {locationHasReadMore && (  
                  <Text style={styles.readMore} onPress={() => setLocationExpanded(true)}>  
                    {" "}  
                    Read more  
                  </Text>  
                )}  
              </Text>  
            </View>
          </>  
        ) : null}  
      </ScrollView>

      {/* Footer */}  
      <View style={styles.footer}>  
        <View>  
          <Text style={styles.footerPrice}>  
            From Rs. {activityData.pricePerGuest} / person  
          </Text>  
        </View>  
        <TouchableOpacity  
          style={styles.footerButton}  
          onPress={() =>  
            navigation.navigate("ConfirmAndPay", {  
              activityId: activityId,  
            })  
          }  
        >  
          <Text style={styles.footerButtonText}>Book Activity</Text>  
        </TouchableOpacity>  
      </View>  
    </View>  
  );  
};

export default ActivityDetails;

const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: "white",  
  },  
  scrollContainer: {  
    flex: 1,  
  },  
  loadingContainer: {  
    flex: 1,  
    justifyContent: "center",  
    alignItems: "center",  
    backgroundColor: "white",  
  },  
  imageContainer: {  
    width: screenWidth,  
  },  
  image: {  
    width: screenWidth,  
    height: 300,  
  },  
  topIconsContainer: {  
    position: "absolute",  
    top: 20,  
    width: "100%",  
    flexDirection: "row",  
    justifyContent: "space-between",  
    paddingHorizontal: 20,  
  },  
  iconButton: {  
    backgroundColor: "white",  
    padding: 10,  
    borderRadius: 25,  
    elevation: 3,  
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.3,  
    shadowRadius: 4,  
  },  
  iconImage: {  
    width: 20,  
    height: 20,  
  },  
  overlay: {  
    position: "absolute",  
    width: "100%",  
    alignItems: "center",  
    bottom: 10,  
  },  
  indicatorContainer: {  
    flexDirection: "row",  
  },  
  indicator: {  
    width: 8,  
    height: 8,  
    borderRadius: 4,  
    marginHorizontal: 6,  
  },  
  title: {  
    fontSize: 23,  
    fontWeight: "600",  
    color: "#333",  
    marginTop: 20,  
    marginLeft: 20,  
    marginBottom: 4  
  },  
  subTitle: {  
    marginLeft: 20,  
    marginTop: 5,  
    fontSize: 15,  
    color: "#555",  
  },  
  lineContainer: {  
    alignItems: "center",  
    width: "100%",  
  },  
  horizontalLine: {  
    height: 1,  
    backgroundColor: "#ccc",  
    width: "90%",  
    marginTop: 15,  
  },    
  lineContainer2: {  
    alignItems: "center",  
    width: "100%",  
  },  
  horizontalLine2: {  
    height: 1,  
    backgroundColor: "#ccc",  
    width: "90%",   
  },
  hostingContainer: {  
    marginTop: 15,  
    marginVertical: 10,  
    paddingHorizontal: 20,  
    marginBottom: 3  
  },  
  titleWithIcon: {  
    flexDirection: "row",  
    alignItems: "center",  
    justifyContent: "space-between",  
  },  
  hostTextContainer: {  
    flex: 1,  
  },  
  hostingTitle: {  
    fontSize: 17,  
    fontWeight: "600",  
    color: "#333",  
    marginBottom: 8,  
  },  
  hostingSubTitle: {  
    fontSize: 15,  
    color: "#666",  
  },  
  hostProfileImage: {  
    width: 45,  
    height: 45,  
    borderRadius: 23,  
    marginLeft: 15,  
  },  
  descriptionContainer: {  
    padding: 20,   
    marginTop: -3
  },  
  descriptionContainer2: {  
    padding: 20,   
    marginTop: -3
  },
  descriptionHeader: {  
    fontSize: 18,  
    fontWeight: "600",  
    color: "#333",  
  },  
  descriptionText: {  
    fontSize: 15,  
    marginTop: 8,  
    color: "#555",  
    textAlign: "justify",  
  },  
  readMore: {  
    color: "black",  
    fontWeight: "600",  
  },  
  footer: {  
    backgroundColor: "white",  
    paddingHorizontal: 20,  
    paddingVertical: 13,  
    flexDirection: "row",  
    alignItems: "center",  
    justifyContent: "space-between",  
    borderTopWidth: 1,  
    borderColor: "#ccc",  
  },  
  footerPrice: {  
    fontSize: 18,  
    fontWeight: "bold",  
    color: "#333",  
  },  
  footerButton: {  
    backgroundColor: "#FF5A5F",  
    paddingVertical: 9,  
    paddingHorizontal: 15,  
    borderRadius: 8,  
  },  
  footerButtonText: {  
    color: "white",  
    fontSize: 16,  
    fontWeight: "600",  
  },  
});
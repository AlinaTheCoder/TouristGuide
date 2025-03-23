// screens/FeedbackScreen.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from "@react-navigation/native";
import apiInstance from "../config/apiConfig";

const FeedbackScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { activityId } = route.params || {};

  const [rating, setRating] = useState(0);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [existingFeedback, setExistingFeedback] = useState(null);

  const MAX_WORDS = 50;

  const issues = [
    "Activity Safety",
    "Guide Knowledge",
    "Equipment Quality",
    "Scenic Views",
    "Time Management",
    "Booking Experience",
  ];

  // Fetch user ID and check for existing feedback
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        // Get user ID
        const uid = await AsyncStorage.getItem("uid");
        setUserId(uid);

        if (uid && activityId) {
          // Check if user already left feedback for this activity
          const response = await apiInstance.get(
            `/feedback/activity/${activityId}/user/${uid}`
          );

          if (response.data.success && response.data.feedback) {
            const feedback = response.data.feedback;
            setExistingFeedback(feedback);
            setRating(feedback.rating || 0);
            setSelectedIssues(feedback.highlights || []);
            setFeedbackText(feedback.text || "");
          }
        }
      } catch (error) {
        console.error("Error initializing feedback screen:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    initializeScreen();
  }, [activityId]);

  useEffect(() => {
    // Count words by splitting on whitespace and filtering out empty strings
    const words = feedbackText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [feedbackText]);

  const toggleIssue = (issue) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  const handleTextChange = (text) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);

    if (words.length <= MAX_WORDS) {
      setFeedbackText(text);
    } else {
      // If the word limit is exceeded, truncate to the first 50 words
      const limitedText = words.slice(0, MAX_WORDS).join(' ');
      setFeedbackText(limitedText);
    }
  };

  // Update the handleSubmit function in FeedbackScreen.jsx
  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please rate your experience before submitting");
      return;
    }

    try {
      setLoading(true);

      const feedbackData = {
        activityId,
        userId,
        rating,
        text: feedbackText,
        highlights: selectedIssues,
      };

      const response = await apiInstance.post("/feedback", feedbackData);

      if (response.data.success) {
        Alert.alert(
          "Feedback Submitted",
          "Thank you for your feedback!",
          [{
            text: "OK",
            onPress: () => {
              // Explicitly navigate to the UserTabs with Trips screen
              navigation.navigate('UserTabs', { screen: 'Trips' });
            }
          }]
        );
      } else {
        Alert.alert("Error", "Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert(
        "Error",
        "Failed to submit feedback. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text style={{ color: "#FF5A5F", marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <Text style={styles.title}>Rate Your Experience</Text>
              <Text style={styles.subtitle}>Are you satisfied with the service?</Text>

              {/* Star Rating */}
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TouchableOpacity key={i} onPress={() => setRating(i)}>
                    <Image
                      source={
                        i <= rating
                          ? require("../images/star_filled.png")
                          : require("../images/star_empty.png")
                      }
                      style={styles.starIcon}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.question}>Tell us what can be improved?</Text>

              {/* Improvement Chips */}
              <View style={styles.chipContainer}>
                {issues.map((issue) => (
                  <TouchableOpacity
                    key={issue}
                    style={[styles.chip, selectedIssues.includes(issue) && styles.chipSelected]}
                    onPress={() => toggleIssue(issue)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedIssues.includes(issue) && styles.chipTextSelected,
                      ]}
                    >
                      {issue}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Feedback Input with Word Counter */}
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tell us how we can improve..."
                  placeholderTextColor="#9E9E9E"
                  multiline
                  value={feedbackText}
                  onChangeText={handleTextChange}
                  maxLength={1000} // A reasonable character limit to prevent extremely long inputs
                  selectionColor="#9E9E9E" // Grey cursor color
                />
                <Text style={[
                  styles.wordCount,
                  wordCount >= MAX_WORDS && styles.wordCountLimit
                ]}>
                  {wordCount}/{MAX_WORDS} words
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (rating > 0 || selectedIssues.length > 0 || feedbackText) &&
                  styles.submitButtonActive,
                ]}
                disabled={rating === 0 || loading}
                onPress={handleSubmit}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitText}>
                    {existingFeedback ? "Update Review" : "Submit"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 32,
    marginBottom: -30
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#000",
    marginTop: 39,
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 16,
    color: "#000",
    marginTop: 5,
    marginBottom: 3,
    fontWeight: "500",
  },
  starsContainer: {
    flexDirection: "row",
    marginVertical: 15,
    marginBottom: 30,
  },
  starIcon: {
    width: 38,
    height: 38,
    marginRight: 5,
  },
  question: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 20,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
    marginBottom: 24,
  },
  chip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D3D3D3",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  chipSelected: {
    backgroundColor: "lightgray",
  },
  chipText: {
    color: "#000",
  },
  chipTextSelected: {
    color: "black",
  },
  textInputContainer: {
    marginBottom: 26,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 10,
    height: 92,
    textAlignVertical: "top",
  },
  wordCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#767676',
    marginTop: 4,
  },
  wordCountLimit: {
    color: '#FF5A5F',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: "#FFB5B8",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    color: 'black'
  },
  submitButtonActive: {
    backgroundColor: "#FF5A5F",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});


export default FeedbackScreen;


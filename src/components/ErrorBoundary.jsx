// src/components/ErrorBoundary.jsx
import React from 'react';
import { View, Text, StyleSheet, Button, Image, TouchableOpacity } from 'react-native';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }


  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI.
    return { hasError: true, error };
  }


  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info);
    // Here you can log the error to an external service (e.g., Sentry)
  }


  resetError = () => {
    this.setState({ hasError: false, error: null });
  };


  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Image style={styles.image}
              source={require("../images/wrong.jpg")}
            />
            <Text style={styles.title}>Something Went Wrong!</Text>
            <Text style={styles.subtitle}>An unexpected error occurred. Please try your request again or check your connection</Text>
            <TouchableOpacity style={styles.button} onPress={this.resetError}>
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 350, // Adjust width as per the image
    height: 350, // Adjust height as per the image
    marginTop: -110,
    marginBottom: -20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: '500', // Made bold
    marginBottom: 18,
    color: 'black'
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: 'center', // Align text centered and justify
    width: 320,
    marginBottom: 10
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 1,
    width: 155,
    marginTop: 28,
    marginLeft: 20
  },
  buttonText: {
    color: 'black',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5
  }
});


export default ErrorBoundary;

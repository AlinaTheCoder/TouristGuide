import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const CertificateViewer = ({ route }) => {
  const { uri } = route.params;

  // Wrap the URI with Google Docs Viewer
  const googleDocsUri = `https://docs.google.com/gview?embedded=true&url=${uri}`;

  return (
    <WebView
      source={{ uri: googleDocsUri }}
      style={styles.webView}
      startInLoadingState
      renderLoading={() => (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5A5F" />
        </View>
      )}
      scalesPageToFit
    />
  );
};

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 10, // 
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    backgroundColor: 'white', // Matches your app's background
  },
});

export default CertificateViewer;

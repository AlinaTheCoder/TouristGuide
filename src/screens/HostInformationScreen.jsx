
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import Header from '../components/Header.jsx';
import InputFieldHostForm from '../components/InputFeildHostForm';
import FooterTwo from '../components/FooterTwo';
import * as DocumentPicker from 'react-native-document-picker';
import CheckBox from 'react-native-check-box';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from '../config/apiConfig';


const HostInformationScreen = () => {
  const navigation = useNavigation();
  const [cnic, setCnic] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [file, setFile] = useState(null); // PAA Certificate File
  const [isUploadingCertificate, setIsUploadingCertificate] = useState(false);
  const [isChecked, setIsChecked] = useState(false); // SECP Checkbox State
  const [companyName, setCompanyName] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [hostId, setHostId] = useState('');


  // Preload saved data from AsyncStorage
  useEffect(() => {
    const fetchHostInfo = async () => {
      try {
        const storedUid = await AsyncStorage.getItem('uid');
        if (storedUid) {
          setHostId(storedUid);
        } else {
          Alert.alert('Error', 'No UID found. Please log in.');
        }


        const savedHostInfo = await AsyncStorage.getItem('hostInfo');
        if (savedHostInfo) {
          const { cnic, phoneNumber, file, companyName, isChecked } = JSON.parse(savedHostInfo);
          setCnic(cnic || '');
          setPhoneNumber(phoneNumber || '');
          setFile(file || null);
          setCompanyName(companyName || '');
          setIsChecked(!!isChecked);
        }
      } catch (error) {
        console.error('Error loading host info:', error);
        Alert.alert('Error', 'Failed to load host information.');
      }
    };
    fetchHostInfo();
  }, []);


  // Handle keyboard visibility
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () =>
      setIsKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () =>
      setIsKeyboardVisible(false)
    );


    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);


  const validateCnic = (cnic) => /^\d{5}-\d{7}-\d{1}$/.test(cnic);
  const validatePhoneNumber = (phoneNumber) => /^\+92\d{10}$/.test(phoneNumber);


  const uploadCertificateToBackend = async (file) => {
    setIsUploadingCertificate(true);
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'application/pdf',
      name: file.name || `certificate_${Date.now()}.pdf`,
    });
    formData.append('fileType', 'certificate');


    try {
      const response = await apiInstance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile({ uri: response.data.url, name: file.name });
      const hostInfo = {
        cnic,
        phoneNumber,
        file: { uri: response.data.url, name: file.name },
        certificateUri: response.data.url,
        companyName: isChecked ? companyName : null,
        isChecked,
        hostId,
      };
      await AsyncStorage.setItem('hostInfo', JSON.stringify(hostInfo));
    } catch (error) {
      Alert.alert('Upload Failed', 'Failed to upload the certificate to the server.');
    } finally {
      setIsUploadingCertificate(false);
    }
  };


  const handleFileSelect = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
 
      const fileSizeInMB = res[0].size / (1024 * 1024); // Convert size to MB
      if (fileSizeInMB > 2) {
        Alert.alert('File Too Large', 'Please select a file that less than 2MB.');
        return;
      }
 
      const selectedFile = {
        uri: res[0].uri,
        name: res[0].name,
        type: res[0].type,
      };
 
      await uploadCertificateToBackend(selectedFile);
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Error', 'Failed to select a file. Please try again.');
      }
    }
  };
 


  const handleDeleteFile = async () => {
    setFile(null);
    const hostInfo = JSON.parse(await AsyncStorage.getItem('hostInfo')) || {};
    hostInfo.file = null;
    hostInfo.certificateUri = null;
    await AsyncStorage.setItem('hostInfo', JSON.stringify(hostInfo));
  };

  const handleNext = async () => {
    if (!validateCnic(cnic)) {
      Alert.alert('Invalid CNIC Number', 'Please enter a valid CNIC number in the format XXXXX-XXXXXXX-X.');
      return;
    }
  
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid Pakistani phone number starting with +92 followed by 10 digits.');
      return;
    }
  
    if (isChecked && !companyName.trim()) {
      Alert.alert('Missing Company Name', 'Please provide your company name as you confirmed SECP registration.');
      return;
    }
  
    const hostInfo = {
      cnic,
      phoneNumber,
      file: file || null,
      companyName: isChecked ? companyName : '',
      certificateUri: file ? file.uri : '', // Handle null case explicitly
      isChecked,
      hostId,
    };
  
    try {
      await AsyncStorage.setItem('hostInfo', JSON.stringify(hostInfo));
      navigation.navigate('FinishHostFormScreen');
    } catch (error) {
      Alert.alert('Error', 'Failed to save host information.');
    }
  };

  const handleBack = () => {
    navigation.navigate('ImagesInformationScreen');
  };


  const progress = 100 / 16.65;


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Header imageSource={require('../icons/seven.png')} title="Host Info" />


            <View style={styles.inputContainer}>
              <Text style={styles.label}>CNIC Number</Text>
              <InputFieldHostForm placeholder="XXXXX-XXXXXXX-X" value={cnic} onChangeText={setCnic} />
            </View>


            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <InputFieldHostForm placeholder="+92XXXXXXXXXX" value={phoneNumber} onChangeText={setPhoneNumber} />
            </View>


            <View style={styles.inputContainer}>
              <Text style={styles.label}>Upload Certificate PAA (Optional) Max: 2MB</Text>
              {file ? (
                <View style={styles.fileContainer}>
                  <Text style={styles.fileInfo}>Uploaded File: {file.name}</Text>
                  <TouchableOpacity style={styles.deleteIcon} onPress={handleDeleteFile}>
                    <Image source={require('../icons/bin.png')} style={styles.icon} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadButton} onPress={handleFileSelect} disabled={isUploadingCertificate}>
                  <Text style={styles.uploadButtonText}>{isUploadingCertificate ? 'Uploading...' : 'Select a PDF File'}</Text>
                </TouchableOpacity>
              )}
            </View>


            <View style={styles.checkboxContainer}>
              <CheckBox isChecked={isChecked} onClick={() => setIsChecked(!isChecked)} rightTextStyle={styles.checkboxLabel} />
              <Text style={styles.checkboxText}>I confirm that I am registered with the SECP.</Text>
            </View>


            {isChecked && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>SECP Registered Company</Text>
                <InputFieldHostForm placeholder="Enter your company name" value={companyName} onChangeText={setCompanyName} />
              </View>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>




        {!isKeyboardVisible && <FooterTwo progress={progress} onNext={handleNext} onBack={handleBack} nextButtonText="Next" backButtonText="Back" />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};




const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#ffffff' },
  inputContainer: { marginBottom: 8 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  uploadButton: { height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRadius: 5, borderWidth: 1, borderColor: '#ccc', marginTop: 8 },
  uploadButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  fileContainer: { height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRadius: 5, borderWidth: 1, borderColor: '#ccc', marginTop: 8, flexDirection: 'row' },
  fileInfo: { flex: 1, fontSize: 16, color: '#666', margin: 15 },
  deleteIcon: { marginRight: 20},
  icon: { width: 20, height: 20 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkboxLabel: { fontSize: 16, color: '#333', marginLeft: 10 },
  checkboxText: { marginLeft: 10, color:'#000000' },
});

export default HostInformationScreen;








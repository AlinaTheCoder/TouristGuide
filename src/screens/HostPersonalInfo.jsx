// HostPersonalInfo.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from '../config/apiConfig';
import { useToast, showSuccessToast } from '../../App'


const HostPersonalInfo = () => {
  const [uid, setUid] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cnic, setCnic] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const toast = useToast();


  const navigation = useNavigation();


  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedUid = await AsyncStorage.getItem('uid');
        const googleUserFlag = await AsyncStorage.getItem('isGoogleUser');
        setIsGoogleUser(googleUserFlag === 'true');


        if (storedUid) {
          setUid(storedUid);


          // CHANGED: call the new endpoint:
          const response = await apiInstance.get(`/hostPersonalInfo/${storedUid}`);
          const { name, email, phoneNumber, cnic } = response.data;


          setFullName(name || 'N/A');
          setEmail(email || 'N/A');
          setPhoneNumber(phoneNumber || 'Not Provided !');
          setCnic(cnic || 'Not Provided !');
        } else {
          Alert.alert('Error', 'No UID found. Please log in.');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);


        // --- Network vs. Server error
        if (!error.response) {
          Alert.alert(
            'Network Error',
            'Unable to reach the server. Please check your internet connection and try again.'
          );
        } else {
          Alert.alert(
            'Error',
            error.response?.data?.error ||
              error.response?.data?.message ||
              error.message ||
              'Failed to retrieve user information.'
          );
        }
      }
    };
    fetchUserInfo();
  }, []);


  const updateName = async (newName) => {
    try {
      const response = await apiInstance.put(`/users/EditName/${uid}`, { name: newName });
      if (response.status === 200) {
        setFullName(newName);
        // Alert.alert('Success', 'Name updated successfully!');
        toast.showSuccess('Name updated successfully!');
      }
    } catch (error) {
      console.error('Error updating name:', error);


      if (!error.response) {
        Alert.alert(
          'Network Error',
          'Unable to reach the server. Please check your internet connection and try again.'
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            'Failed to update name.'
        );
      }
    }
  };


  const changePassword = async (newPassword) => {
    try {
      const response = await apiInstance.put('/users/ChangePassword', { uid, newPassword });
      if (response.status === 200) {
        setPassword(newPassword);
        toast.showSuccess('Password changed successfully!');
        // Alert.alert('Success', 'Password changed successfully!');
      }
    } catch (error) {
      console.error('Error changing password:', error);


      if (!error.response) {
        Alert.alert(
          'Network Error',
          'Unable to reach the server. Please check your internet connection and try again.'
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            'Failed to change password.'
        );
      }
    }
  };

// Toggle password visibility
const togglePasswordVisibility = () => {
  setPasswordVisible(!isPasswordVisible);
};
  const saveEdit = () => {
    if (editingField === 'fullName') {
      const trimmedName = tempValue.trim();


      if (trimmedName.length < 4) {
        Alert.alert('Invalid Name', 'Name must be at least 4 characters long (letters only).');
        return;
      }


      if (!/^[A-Za-z ]+$/.test(trimmedName)) {
        Alert.alert(
          'Invalid Name',
          'Name must not contain digits or special characters.'
        );
        return;
      }


      updateName(tempValue);
    } else if (editingField === 'password') {
      if (tempValue.length < 6) {
        Alert.alert('Invalid Password', 'Password must be at least 6 characters long.');
        return;
      }


      changePassword(tempValue);
    }


    closeEditModal();
  };


  const closeEditModal = () => {
    setModalVisible(false);
    setEditingField(null);
    setTempValue('');
    setPasswordVisible(false);
  };


  const startEditing = (field) => {
    setEditingField(field);
    setTempValue(field === 'fullName' ? fullName : password);
    setModalVisible(true);
  };


const renderEditableRow = (label, value, field, buttonText) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      {field && (
        <TouchableOpacity onPress={() => startEditing(field)} style={styles.editButton}>
          <Text style={styles.editButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('HostTabs', { screen: 'HostProfile' })}
          style={styles.backButton}
        >
          <Image source={require('../icons/BackArrow.png')} style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>
      <Text style={styles.headerTitle}>Host Personal Info</Text>

      {/* Name Section */}
      {renderEditableRow('Legal name', fullName, 'fullName', 'Edit')}

      {/* Email Section */}
      <View style={styles.infoRow}>
        <View style={styles.infoLeft}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{email}</Text>
        </View>
      </View>

      {/* Phone Number Section */}
      <View style={styles.infoRow}>
        <View style={styles.infoLeft}>
          <Text style={styles.infoLabel}>Phone Number</Text>
          <Text style={styles.infoValue}>{phoneNumber}</Text>
        </View>
      </View>

      {/* CNIC Section */}
      <View style={styles.infoRow}>
        <View style={styles.infoLeft}>
          <Text style={styles.infoLabel}>CNIC</Text>
          <Text style={styles.infoValue}>{cnic}</Text>
        </View>
      </View>


      {/* Password Section */}
      {!isGoogleUser && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Password</Text>
          <TouchableOpacity onPress={() => startEditing('password')} style={styles.changePasswordButton}>
            <Text style={styles.changePasswordButtonText}>Change</Text>
          </TouchableOpacity>
        </View>
      )}

<Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalLabel}>
              {editingField === 'fullName' ? 'Edit Name' : 'Change Password'}
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.modalInputField}
                value={tempValue}
                onChangeText={setTempValue}
                secureTextEntry={editingField === 'password' && !isPasswordVisible}
                placeholder={editingField === 'password' ? 'Enter new password' : ''}
                placeholderTextColor="#aaaaaa"
              />
              
              {editingField === 'password' && (
                <TouchableOpacity 
                  style={styles.eyeIconContainer} 
                  onPress={togglePasswordVisibility}
                >
                  <Image 
                    source={isPasswordVisible 
                      ? require('../icons/eye-open.png') 
                      : require('../icons/eye-closed.png')} 
                    style={styles.eyeIcon} 
                  />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeEditModal} style={styles.outlineButton}>
                <Text style={styles.outlineButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
   
    </ScrollView>
  );
};


export default HostPersonalInfo;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  backButton: {
    marginRight: 10,
    marginTop: 10,
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '600',
    color: '#000',
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoLeft: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  editButton: {
    paddingHorizontal: 10,
  },
  editButtonText: {
    fontSize: 16,
    color: 'black',
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  changePasswordButton: {
    paddingHorizontal: 10,
  },
  changePasswordButtonText: {
    fontSize: 16,
    color: 'black',
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    width: 320,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  modalLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#cccccc',
    marginBottom: 20,
  },
  modalInputField: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 18,
    color: '#000000',
    textAlign: 'left',
  },
  eyeIconContainer: {
    padding: 5,
  },
  eyeIcon: {
    width: 22,
    height: 22,
    tintColor: '#555',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 5,
    marginRight: 5,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  outlineButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    flex: 1,
    backgroundColor: 'black',
    borderRadius: 5,
    marginLeft: 5,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
  },
});
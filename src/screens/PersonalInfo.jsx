import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from '../config/apiConfig';

const PersonalInfo = () => {
    const [uid, setUid] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);

    const navigation = useNavigation();

    useEffect(() => {
        const fetchUid = async () => {
            try {
                const storedUid = await AsyncStorage.getItem('uid');
                const googleUserFlag = await AsyncStorage.getItem('isGoogleUser');

                setIsGoogleUser(googleUserFlag === 'true');

                if (storedUid) {
                    setUid(storedUid);
                    const response = await apiInstance.get(`/users/GetUserById/${storedUid}`);
                    setFullName(response.data.name || 'N/A');
                    setEmail(response.data.email || 'N/A');
                } else {
                    Alert.alert('Error', 'No UID found. Please log in.');
                }
            } catch (error) {
                console.error('Error fetching UID:', error);
                Alert.alert('Error', 'Failed to retrieve UID.');
            }
        };
        fetchUid();
    }, []);

    const updateName = async (newName) => {
        try {
            const response = await apiInstance.put(`/users/EditName/${uid}`, { name: newName });
            if (response.status === 200) {
                setFullName(newName);
                Alert.alert('Success', 'Name updated successfully!');
            }
        } catch (error) {
            console.error('Error updating name:', error);
            Alert.alert('Error', 'Failed to update name.');
        }
    };

    const changePassword = async (newPassword) => {
        try {
            const response = await apiInstance.put('/users/ChangePassword', { uid, newPassword });
            if (response.status === 200) {
                setPassword(newPassword);
                Alert.alert('Success', 'Password changed successfully!');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            Alert.alert('Error', 'Failed to change password.');
        }
    };

    // here 
    const saveEdit = () => {
        if (editingField === 'fullName') {
            const trimmedName = tempValue.trim();

            if (trimmedName.length < 4) {
                Alert.alert(
                    'Invalid Name',
                    'Name must be at least 4 characters long (letters only).'
                );
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
        }
        else if (editingField === 'password') {
            if (tempValue.length < 6) {
                Alert.alert(
                    'Invalid Password',
                    'Password must be at least 6 characters long.'
                );
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
                <TouchableOpacity onPress={() => navigation.navigate('UserTabs', { screen: 'UserProfile' })} style={styles.backButton}>
                    <Image source={require('../icons/BackArrow.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>Personal Info</Text>

            {/* Name Section */}
            {renderEditableRow('Legal name', fullName, 'fullName', 'Edit')}

            {/* Email Section */}
            <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{email}</Text>
                </View>
            </View>

            {/* Password Section (Only if not a Google user) */}
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
                        <TextInput
                            style={styles.modalInputField}
                            value={tempValue}
                            onChangeText={setTempValue}
                            secureTextEntry={editingField === 'password' && !isPasswordVisible}
                        />
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
        fontWeight: '700'
    },
    changePasswordButton: {
        paddingHorizontal: 10,
    },
    changePasswordButtonText: {
        fontSize: 16,
        color: 'black',
        textDecorationLine: 'underline',
        fontWeight: '700'
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
    modalInputField: {
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingVertical: 8,
        fontSize: 18,
        color: '#333',
        marginBottom: 15,
        backgroundColor: 'transparent',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    saveButton: {
        backgroundColor: '#000000',
        borderRadius: 8,
        paddingVertical: 12,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: '600',
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: '#000000',
        borderRadius: 8,
        paddingVertical: 12,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    outlineButtonText: {
        fontSize: 16,
        color: '#000000',
        fontWeight: '600',
    },
});

export default PersonalInfo;

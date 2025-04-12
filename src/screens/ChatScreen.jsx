// src/screens/ChatScreen.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
    Alert,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiInstance from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Message component for individual chat messages with timestamp
const ChatMessage = ({ message, isUser, timestamp }) => (
    <View style={[
        styles.messageRow,
        isUser ? styles.userMessageRow : styles.aiMessageRow
    ]}>
        {!isUser && (
            <Image
                source={require('../icons/assistant.png')}
                style={styles.avatar}
            />
        )}
        <View style={styles.messageContentContainer}>
            <View style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.aiBubble
            ]}>
                <Text style={[
                    styles.messageText,
                    isUser ? styles.userMessageText : styles.aiMessageText
                ]}>
                    {message}
                </Text>
            </View>
            <Text style={[
                styles.timestamp,
                isUser ? styles.userTimestamp : styles.aiTimestamp
            ]}>
                {timestamp}
            </Text>
        </View>
    </View>
);

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const navigation = useNavigation();
    const flatListRef = useRef(null);

    // Format current time as HH:MM
    const getCurrentTime = () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };
    // Create initial message with current timestamp
    const createInitialMessage = () => ({
        text: 'Hello! I\'m your TouristGuide assistant. How can I help you explore Pakistan today?',
        isUser: false,
        id: '1',
        timestamp: getCurrentTime()
    });

    // Load messages from AsyncStorage
    useEffect(() => {
        const loadMessages = async () => {
            try {
                // First get the user ID
                const uid = await AsyncStorage.getItem('uid');
                
                if (uid) {
                    setUserId(uid);
                    
                    // Use user-specific key for chat messages
                    const savedMessages = await AsyncStorage.getItem(`chat_messages_${uid}`);
                    
                    if (savedMessages) {
                        let userMessages = JSON.parse(savedMessages);
                        
                        // Check if there are any messages
                        if (userMessages.length > 0) {
                            // Check if user has only the welcome message (no actual chat yet)
                            const hasOnlyWelcomeMessage = userMessages.length === 1 && 
                                                         userMessages[0].id === '1' && 
                                                         !userMessages[0].isUser;
                            
                            if (hasOnlyWelcomeMessage) {
                                // If user has only seen welcome message but never chatted,
                                // update the timestamp to current time
                                userMessages[0].timestamp = getCurrentTime();
                                await AsyncStorage.setItem(`chat_messages_${uid}`, JSON.stringify(userMessages));
                            }
                            
                            // Set the messages (either original or with updated timestamp)
                            setMessages(userMessages);
                        } else {
                            // If no messages, add the initial message with current timestamp
                            const initialMessage = createInitialMessage();
                            userMessages = [initialMessage];
                            await AsyncStorage.setItem(`chat_messages_${uid}`, JSON.stringify(userMessages));
                            setMessages(userMessages);
                        }
                    } else {
                        // If no saved messages for this user, set initial message with current timestamp
                        const initialMessage = createInitialMessage();
                        setMessages([initialMessage]);
                        
                        // Save initial message for this user
                        await AsyncStorage.setItem(`chat_messages_${uid}`, JSON.stringify([initialMessage]));
                    }
                } else {
                    // No user ID, just show initial message without saving
                    setMessages([createInitialMessage()]);
                }
            } catch (error) {
                console.error('Error loading chat history:', error);
                // Fallback to initial message
                setMessages([createInitialMessage()]);
            }
        };

        loadMessages();
    }, []);

    // Save messages to AsyncStorage whenever they change
    useEffect(() => {
        const saveMessages = async () => {
            if (!userId) return; // Don't save if no user ID
            
            try {
                // Use user-specific key for chat messages
                await AsyncStorage.setItem(`chat_messages_${userId}`, JSON.stringify(messages));
            } catch (error) {
                console.error('Error saving chat history:', error);
            }
        };

        // Only save if we have userId and messages
        if (userId && messages.length > 0) {
            saveMessages();
        }
    }, [messages, userId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const currentTime = getCurrentTime();
        const userMessage = {
            text: inputText.trim(),
            isUser: true,
            id: Date.now().toString(),
            timestamp: currentTime
        };

        // Add user message to chat
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // Call your backend API
            const response = await apiInstance.post('/ai/chat', {
                message: userMessage.text,
                userId: userId
            });

            if (response.data.success) {
                // Add AI response to chat with slight delay for realism
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev,
                        {
                            text: response.data.response,
                            isUser: false,
                            id: (Date.now() + 1).toString(),
                            timestamp: getCurrentTime()
                        }
                    ]);
                    setIsLoading(false);
                }, 1000);
            } else {
                throw new Error('Failed to get response from AI');
            }
        } catch (error) {
            console.error('Error sending message:', error);

            // Add error message
            setMessages(prev => [
                ...prev,
                {
                    text: 'Sorry, I encountered an error. Please try again.',
                    isUser: false,
                    id: (Date.now() + 1).toString(),
                    timestamp: getCurrentTime()
                }
            ]);

            setIsLoading(false);

            // Show network vs server error
            if (!error.response) {
                Alert.alert(
                    'Network Error',
                    'Unable to reach the server. Please check your internet connection and try again.'
                );
            } else {
                Alert.alert(
                    'Error',
                    error.response.data?.message || error.message || 'Failed to process your request'
                );
            }
        }
    };

    // Reset chat history
    const handleReset = () => {
        if (!userId) {
            // Can't reset if no user ID
            Alert.alert('Error', 'Unable to reset chat history without user ID');
            return;
        }
        
        Alert.alert(
            'Reset Conversation',
            'Are you sure you want to clear this conversation?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Reset',
                    onPress: async () => {
                        // Create a new initial message with the current timestamp
                        const initialMessage = createInitialMessage();
                        setMessages([initialMessage]);
                        
                        try {
                            // Use user-specific key for chat messages
                            await AsyncStorage.setItem(`chat_messages_${userId}`, JSON.stringify([initialMessage]));
                        } catch (error) {
                            console.error('Error resetting chat history:', error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Image
                            source={require('../icons/back.png')}
                            style={styles.backIcon}
                        />
                    </TouchableOpacity>

                    <View style={styles.headerProfile}>
                        <Image
                            source={require('../icons/assistant.png')}
                            style={styles.headerAvatar}
                        />
                        <Text style={styles.headerTitle}>Assistant</Text>
                        <View style={styles.onlineIndicator} />
                    </View>
                </View>
                
                <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleReset}
                >
                    <Image
                        source={require('../icons/reset.png')}
                        style={styles.resetIcon}
                    />
                </TouchableOpacity>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <ChatMessage
                        message={item.text}
                        isUser={item.isUser}
                        timestamp={item.timestamp}
                    />
                )}
                contentContainerStyle={styles.messagesContainer}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FF5A5F" />
                    <Text style={styles.loadingText}>Thinking...</Text>
                </View>
            )}

            <View style={styles.bottomContainer}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Message"
                        placeholderTextColor="#999"
                        multiline
                        maxLength={500}
                    />
                </View>

                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSend}
                    disabled={isLoading || !inputText.trim()}
                >
                    <Image
                        source={require('../icons/trips.png')}
                        style={styles.sendIcon}
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        paddingBottom: 17,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: 'lightgrey',
        marginTop: 8
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
        marginRight: 4,
    },
    backIcon: {
        width: 20,
        height: 20,
        tintColor: '#000000',
    },
    headerProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    headerAvatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
    },
    onlineIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginLeft: 8,
        marginTop: 4
    },
    resetButton: {
        padding: 10,
        marginRight: 4,
    },
    resetIcon: {
        width: 24,
        height: 24,
        // tintColor: '#FF5A5F', // Maintaining the brand color
        tintColor: '#000000',
    },
    messagesContainer: {
        marginTop: 12,
        padding: 12,
        paddingBottom: 16,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-end',
    },
    userMessageRow: {
        justifyContent: 'flex-end',
    },
    aiMessageRow: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    messageContentContainer: {
        maxWidth: '75%',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 20,
    },
    userBubble: {
        backgroundColor: '#FF5A5F',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: '#F5F5F5',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    userMessageText: {
        color: '#FFFFFF',
    },
    aiMessageText: {
        color: '#333333',
    },
    timestamp: {
        fontSize: 11,
        marginTop: 4,
    },
    userTimestamp: {
        color: '#9E9E9E',
        textAlign: 'right',
    },
    aiTimestamp: {
        color: '#9E9E9E',
        textAlign: 'left',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    loadingText: {
        marginLeft: 8,
        color: '#666666',
        fontSize: 14,
    },
    bottomContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginBottom: 10,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingHorizontal: 12,
        backgroundColor: 'white',
        borderRadius: 30,
        borderColor: 'black',
        borderWidth: 1,
        marginRight: 10,
    },
    input: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        maxHeight: 120,
        color: 'black',
        marginRight: 5,
    },
    sendButton: {
        width: 55,
        height: 55,
        borderRadius: 30,
        backgroundColor: '#FF5A5F',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#FFADB0',
    },
    sendIcon: {
        width: 24,
        height: 24,
        tintColor: '#FFFFFF',
    }
});

export default ChatScreen;
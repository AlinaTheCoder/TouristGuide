// src/config/socketConfig.js
import io from 'socket.io-client';

const SOCKET_URL = 'https://site--touristguide-backend--cvxqfmjcdkln.code.run'; // Fixed URL format

// const socket = io(SOCKET_URL, {
//   transports: ['websocket'],
//   reconnection: true,
//   reconnectionDelay: 1000,
//   reconnectionAttempts: 10
// });

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 500,        // Reduced from 1000ms to 500ms
  reconnectionDelayMax: 5000,    // Maximum delay between attempts
  randomizationFactor: 0.5,      // Add some randomization to prevent thundering herd
  reconnectionAttempts: 10
});

// Add connection event listeners for debugging (optional)
socket.on('connect', () => {
  console.log('Socket connected successfully');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

export default socket;
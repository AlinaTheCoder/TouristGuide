// config/socketConfig.js
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://192.168.10.102:3000'; // Update as needed
const socket = io(SOCKET_SERVER_URL);

export default socket;

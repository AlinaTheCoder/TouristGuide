// config/socketConfig.js
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://10.109.50.34:3000'; // Update as needed
const socket = io(SOCKET_SERVER_URL);

export default socket;

// config/socketConfig.js
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://10.10.64.182:3000'; // Update as needed
const socket = io(SOCKET_SERVER_URL);

export default socket;

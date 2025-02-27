import axios from 'axios';

// Define the base URL for API calls (change to your IP and port)
const API_BASE_URL = 'http://10.109.50.34:3000'; // Replace with your Express.js backend address

// Create an Axios instance with the base URL
const apiInstance = axios.create({
  baseURL: API_BASE_URL,
//   timeout: 60000, // Optional timeout for network requests
});

export default apiInstance;

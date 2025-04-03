// src/config/apiConfig.js
import axios from 'axios';

const API_BASE_URL = 'http://192.168.10.102:3000'; // Replace with your Express.js backend address

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Optional timeout for network requests
});

// Add a response interceptor to log errors centrally (you can extend this as needed)
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiInstance;

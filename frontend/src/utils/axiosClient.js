import axios from 'axios';

const axiosClient = axios.create({
    // VITE_BACKEND_URL will be set in Render environment variables
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
    withCredentials: true // CRITICAL: This allows cookies to be sent/received
});

export default axiosClient;
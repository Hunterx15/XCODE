import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000', // e.g. https://xcode-uxcs.onrender.com
  withCredentials: true,                 // ⭐ REQUIRED for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;

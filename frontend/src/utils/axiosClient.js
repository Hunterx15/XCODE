import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. https://xcode-uxcs.onrender.com
  withCredentials: true,                 // ⭐ REQUIRED for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;

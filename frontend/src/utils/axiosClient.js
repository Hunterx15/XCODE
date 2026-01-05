import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // ⭐ REQUIRED FOR COOKIES
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;

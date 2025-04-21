import axios from "axios";

// Log the backend URL for debugging
console.log("Creating axios instance with baseURL:", import.meta.env.VITE_BACKEND_URL);

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}`, // Change this to match your backend URL
  headers: { "Content-Type": "application/json" },
});

// Add request interceptor for debugging
API.interceptors.request.use(
  (config) => {
    console.log(`🔶 Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
API.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      console.error("❌ Error response:", error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("❌ No response received:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("❌ Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

export default API;

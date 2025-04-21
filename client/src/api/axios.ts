import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}`, // Change this to match your backend URL
  headers: { "Content-Type": "application/json" },
});

export default API;

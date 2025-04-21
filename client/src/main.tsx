import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
// import { BrowserRouter, Router } from 'react-router-dom'
import { Web3Provider } from "./contexts/Web3Context.tsx";
import { Toaster } from "react-hot-toast";

// Log environment variables for debugging
console.log("Vite environment variables:", {
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
});

createRoot(document.getElementById("root")!).render(
  <Web3Provider>
    <Toaster />
    <App />
  </Web3Provider>
);

import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
// import { BrowserRouter, Router } from 'react-router-dom'
import { Web3Provider } from "./contexts/Web3Context.tsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <Web3Provider>
    <Toaster />
    <App />
  </Web3Provider>
);

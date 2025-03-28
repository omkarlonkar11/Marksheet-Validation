import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import "react-toastify/ReactToastify.css";
import Web3Provider from "./contexts/Web3Provider";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Web3Provider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/home" element={<Home />} />
        </Routes>
      </Web3Provider>
    </Router>
  );
}

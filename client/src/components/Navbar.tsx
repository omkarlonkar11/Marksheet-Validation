import { Link, useNavigate } from "react-router-dom";
import { handleSuccess } from "../utils/utils";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Wallet from "./Wallet";

export default function Navbar() {
  const isLoggedIn = localStorage.getItem("token"); // Check if the user is logged in
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    handleSuccess("Successfully Loggedout");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };
  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link
            to="/home"
            className="text-white text-lg font-semibold">
            Marksheet System
          </Link>
          
          {/* Verification link always visible */}
          <Link
            to="/verify"
            className="text-white px-4 py-2 ml-6 rounded-md hover:bg-blue-700 transition duration-300">
            Verify Marksheet
          </Link>
        </div>
        
        <div className="flex space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <Wallet />
              <button
                onClick={handleLogout}
                className="text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                Login
              </Link>
              <Link
                to="/signup"
                className="text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
      <ToastContainer aria-label="Notification container" />
    </nav>
  );
}

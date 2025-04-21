import { Link, useNavigate, useLocation } from "react-router-dom";
import { handleSuccess } from "../utils/utils";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Wallet from "./Wallet";

export default function Navbar() {
  const isLoggedIn = localStorage.getItem("token"); // Check if the user is logged in
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    handleSuccess("Successfully Logged out");
    setTimeout(() => {
      navigate("/"); // Redirect to landing page instead of login
    }, 1000);
  };

  // Apply different styles for the landing page
  const navbarClass = isLandingPage 
    ? "absolute top-0 left-0 right-0 z-10 bg-transparent p-4" 
    : "bg-blue-600 p-4 shadow-md";

  const textClass = isLandingPage ? "text-blue-800" : "text-white";
  const buttonClass = isLandingPage 
    ? "text-blue-800 px-4 py-2 rounded-md hover:bg-blue-50 transition duration-300" 
    : "text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300";

  return (
    <nav className={navbarClass}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link
            to={isLoggedIn ? "/home" : "/"}
            className={`${textClass} text-lg font-semibold`}>
            Marksheet System
          </Link>
        </div>
        
        <div className="flex space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <Wallet />
              <button
                onClick={handleLogout}
                className={buttonClass}>
                Logout
              </button>
            </div>
          ) : (
            <>
              {/* Don't show login/signup on landing page as they're already there */}
              {!isLandingPage && (
                <>
                  <Link
                    to="/login"
                    className={buttonClass}>
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className={buttonClass}>
                    Signup
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <ToastContainer aria-label="Notification container" />
    </nav>
  );
}

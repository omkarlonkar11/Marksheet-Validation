import { Link, useNavigate } from "react-router-dom";
import { handleSuccess } from "../utils/utils";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Wallet from "../pages/Wallet";

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
      <div className="container mx-auto flex justify-end space-x-4">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
            Logout
          </button>
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
            <Wallet />
          </>
        )}
      </div>
      <ToastContainer aria-label="Notification container" />
    </nav>
  );
}

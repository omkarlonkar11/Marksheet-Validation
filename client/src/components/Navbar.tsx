import { Link, useNavigate } from "react-router-dom";
import { handleSuccess } from "../utils/utils";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connectWallet } from "../utils/ConnectWallet";

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
          <div>
            <button
              className="text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
              onClick={connectWallet}>
              Connect Wallet
            </button>
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
      <ToastContainer aria-label="Notification container" />
    </nav>
  );
}

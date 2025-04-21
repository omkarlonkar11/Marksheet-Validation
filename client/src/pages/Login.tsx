import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleError, handleSuccess } from "../utils/utils";
import { ToastContainer } from "react-toastify";

export default function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (user) {
      navigate("/home");
    }
    
    // Log the backend URL to verify it's correct
    console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);
    
    // Test the API connection
    testBackendConnection();
  }, [navigate]);
  
  // Function to test if backend is reachable
  const testBackendConnection = async () => {
    try {
      console.log("Testing connection to backend...");
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: "HEAD", // Just checking connection, not sending data
      });
      console.log("Backend response status:", response.status);
    } catch (error) {
      console.error("Backend connection test failed:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError("Email or Password are not Provided");
    }
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/auth/login`;
      console.log("Login request to URL:", url);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginInfo),
      });
      
      console.log("Login response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Login result:", result);
      
      const {
        success,
        message,
        jwtToken,
        name,
        error,
        email: userEmail,
      } = result;

      if (success) {
        handleSuccess(message);
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("loggedInUser", name);
        localStorage.setItem("email", userEmail);
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else if (error) {
        const details =
          error?.details?.[0]?.message || error.message || "Login failed";
        handleError(details);
      } else {
        handleError(message || "Login failed");
      }
    } catch (error) {
      console.error("Login error details:", error);
      handleError((error as Error).message || "An error occurred during login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Email
            </label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              autoComplete="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              value={loginInfo.email}
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Password
            </label>
            <input
              onChange={handleChange}
              type="password"
              name="password"
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              value={loginInfo.password}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300">
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600 text-sm">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
}

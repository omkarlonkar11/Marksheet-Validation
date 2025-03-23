import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-end space-x-4">
        <Link
          to="/login"
          className="text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
        >
          Signup
        </Link>
      </div>
    </nav>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero-image.svg";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-blue-800 leading-tight animate-fade-in">
              Blockchain-Powered 
              <span className="block text-blue-600">Marksheet Validation</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl animate-fade-in delay-100">
              Secure, tamper-proof academic records on the blockchain. 
              Verify credentials instantly and maintain integrity of educational achievements.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 animate-fade-in delay-200">
              <Link 
                to="/login" 
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg text-center"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="px-8 py-3 bg-white text-blue-600 font-medium rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition duration-300 text-center"
              >
                Create Account
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 animate-fade-in delay-300">
            <img 
              src={heroImage} 
              alt="Blockchain Certificate Verification" 
              className="w-full h-auto rounded-xl shadow-xl animate-float" 
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12 animate-fade-in">Why Choose Our Platform?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 animate-fade-in delay-100">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Tamper-Proof Security</h3>
              <p className="text-gray-600">Academic records secured by blockchain technology, ensuring integrity and preventing unauthorized modifications.</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 animate-fade-in delay-200">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Instant Verification</h3>
              <p className="text-gray-600">Verify any academic credential in seconds with our QR-code enabled verification system.</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 animate-fade-in delay-300">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Digital Credentials</h3>
              <p className="text-gray-600">Create and manage digital academic records, making credentials portable and universally verifiable.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 
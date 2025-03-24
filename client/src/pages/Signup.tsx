import { useState } from "react";
import { handleSuccess } from "../utils";  // Adjust the path if needed
import { handleError } from "../utils"  // Adjust the path if needed
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  
  const [signupInfo , setsignupInfo]=useState({
    name:"",
    email:"",
    password:""
  })

  const navigate = useNavigate();

  const handleChange =(e)=>{
      const {name , value} = e.target ;
      console.log(name , value);
      const copysignupInfo ={  ...signupInfo  };
      copysignupInfo[name]=value;
      setsignupInfo(copysignupInfo);
  }
  const handleSingup = async (e) =>{
    e.preventDefault();
    const {name , email , password}=signupInfo;
    if(!name || !email || !password){
      return handleError('Either Name , Email or Password are not Provided')
    }
    try {
      const url="http://localhost:8080/auth/signup";
      const response= await fetch(url ,{
        method:"POST",
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify(signupInfo)
    });
    const result=await response.json();
    const {success , message , error}= result;
    if(success)
    {
       handleSuccess(message);
       setTimeout(()=>{
        navigate('/login');
       } , 1000)
    }
    else if(error){
      const details =error?.details[0].message;
      handleError(details);
    }
    else if(!success)
    {
      handleError(message);
    }
    console.log(result);
    } catch (error) {
      handleError(error);
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Sign Up
        </h2>
        <form   onSubmit={handleSingup} className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Username
            </label>
            <input
            onChange={handleChange}
              type="text"
              name="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
              
              value={signupInfo.name}
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Email
            </label>
            <input
            onChange={handleChange}
              type="email"
              name="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              
              value={signupInfo.email}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              
              value={signupInfo.password}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Login
          </a>
        </p>
      </div>
      <ToastContainer/>
    </div>
  );
}
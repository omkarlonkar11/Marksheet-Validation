import React, { useState } from "react";
import { generateMarksheetHash } from "../utils/blockchain";
import { useWeb3Context } from "../contexts/Web3Context";
import { connectWallet } from "../utils/ConnectWallet";
import { toast } from "react-hot-toast";

export default function VerifyMarksheet() {
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [semester, setSemester] = useState("");
  const [hash, setHash] = useState("");
  const [verificationResult, setVerificationResult] = useState<
    "verified" | "invalid" | null
  >(null);
  const [qrCodeData, setQrCodeData] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { web3State } = useWeb3Context();

  // Verification using blockchain
  const verifyWithBlockchain = async (studentId: string, documentHash: string) => {
    try {
      if (!web3State.contractInstance || !web3State.selectedAccount) {
        // If wallet not connected, try to connect
        const walletData = await connectWallet();
        if (!walletData) {
          toast.error("Please connect your wallet to verify");
          return false;
        }
      }

      // Use contract to verify the hash
      const contractInstance = web3State.contractInstance;
      const result = await contractInstance.verifyHash(studentId, documentHash);
      return result;
    } catch (error) {
      console.error("Blockchain verification error:", error);
      toast.error("Error verifying document on blockchain");
      return false;
    }
  };

  // Handle manual verification
  const handleVerify = async () => {
    if (!enrollmentNumber || !semester) {
      toast.error("Please enter both enrollment number and semester");
      return;
    }

    setIsVerifying(true);
    
    try {
      // Generate the hash for local comparison
      const generatedHash = generateMarksheetHash(enrollmentNumber, semester);
      
      // First compare locally
      const locallyVerified = hash === generatedHash;
      
      // If we have blockchain connection, verify on blockchain too
      let blockchainVerified = false;
      const studentId = `${enrollmentNumber}-${semester}`;
      
      if (web3State.contractInstance) {
        blockchainVerified = await verifyWithBlockchain(studentId, hash);
      } else {
        // If no blockchain connection, rely on local verification
        blockchainVerified = locallyVerified;
      }
      
      // Document is verified if both local and blockchain verification pass
      if (locallyVerified && blockchainVerified) {
        setVerificationResult("verified");
        toast.success("Document verified successfully");
      } else {
        setVerificationResult("invalid");
        toast.error("Document verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Error during verification");
      setVerificationResult("invalid");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle QR code scan
  const handleQrCodeData = async (qrData: string) => {
    try {
      const parsedData = JSON.parse(qrData);
      setQrCodeData(parsedData);
      
      // Set form fields with QR data
      setEnrollmentNumber(parsedData.enrollmentNumber || "");
      setSemester(parsedData.semester || "");
      setHash(parsedData.hash || "");
      
      // Automatically verify if we have all data
      if (parsedData.enrollmentNumber && parsedData.semester && parsedData.hash) {
        // Verify with blockchain
        setIsVerifying(true);
        
        try {
          // Generate locally for comparison
          const generatedHash = generateMarksheetHash(
            parsedData.enrollmentNumber,
            parsedData.semester
          );
          
          // Check if local hash matches
          const locallyVerified = parsedData.hash === generatedHash;
          
          // If we have blockchain connection, verify on blockchain too
          let blockchainVerified = false;
          const studentId = `${parsedData.enrollmentNumber}-${parsedData.semester}`;
          
          if (web3State.contractInstance) {
            blockchainVerified = await verifyWithBlockchain(studentId, parsedData.hash);
          } else {
            // If no blockchain connection, rely on local verification
            blockchainVerified = locallyVerified;
          }
          
          // Document is verified if both local and blockchain verification pass
          if (locallyVerified && blockchainVerified) {
            setVerificationResult("verified");
            toast.success("Document verified successfully");
          } else {
            setVerificationResult("invalid");
            toast.error("Document verification failed");
          }
        } catch (error) {
          console.error("Verification error:", error);
          toast.error("Error during verification");
          setVerificationResult("invalid");
        } finally {
          setIsVerifying(false);
        }
      }
    } catch (error) {
      console.error("Invalid QR code data", error);
      toast.error("Invalid QR code data");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-md shadow-md max-w-lg w-full p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          Verify Marksheet Authenticity
        </h1>

        {/* QR Code scan section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h2 className="text-lg font-medium mb-3">Scan QR Code</h2>
          <p className="text-sm text-gray-600 mb-4">
            You can verify a marksheet by scanning its QR code or by manually
            entering details below.
          </p>
          
          {/* In a real implementation, you would have a QR code scanner here */}
          <div className="text-center">
            <p className="text-sm">QR code scanner would be integrated here</p>
            {/* Placeholder for scanner */}
            <div className="border-2 border-dashed border-gray-300 rounded-md h-40 flex items-center justify-center my-3">
              <p className="text-gray-500">QR Scanner Placeholder</p>
            </div>
          </div>
        </div>

        {/* Manual verification section */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="enrollmentNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Enrollment Number
            </label>
            <input
              type="text"
              id="enrollmentNumber"
              value={enrollmentNumber}
              onChange={(e) => setEnrollmentNumber(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>

          <div>
            <label
              htmlFor="semester"
              className="block text-sm font-medium text-gray-700"
            >
              Semester
            </label>
            <input
              type="text"
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>

          <div>
            <label
              htmlFor="hash"
              className="block text-sm font-medium text-gray-700"
            >
              Document Hash (from QR Code)
            </label>
            <input
              type="text"
              id="hash"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isVerifying 
                ? "bg-indigo-400 cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            }`}
          >
            {isVerifying ? "Verifying..." : "Verify Document"}
          </button>
        </div>

        {/* Verification result */}
        {verificationResult && (
          <div
            className={`mt-6 p-4 rounded-md ${
              verificationResult === "verified"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {verificationResult === "verified" ? (
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">
                  {verificationResult === "verified"
                    ? "Document Verified"
                    : "Invalid Document"}
                </h3>
                <div className="mt-2 text-sm">
                  <p>
                    {verificationResult === "verified"
                      ? "This document is authentic and has been verified on the blockchain."
                      : "This document could not be verified. It may have been tampered with."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
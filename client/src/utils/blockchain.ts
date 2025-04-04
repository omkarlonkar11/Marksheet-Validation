import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { connectWallet } from "./ConnectWallet";
import contractAbi from "../constants/ContractABI.json";

const PUBLIC_RPC_URL =
  "https://sepolia.infura.io/v3/43566bffdb114ef4b0047262fa4ba52d";

const contractAddress: string = "0xd290eAcA58e1cCB27E66Be5DCa493773d603c9b7";

// Function to generate a hash from enrollment number and semester
export const generateMarksheetHash = (
  enrollmentNumber: string,
  semester: string
): string => {
  // Create a simple hash using keccak256 (standard in Ethereum)
  const hash = ethers.keccak256(
    ethers.toUtf8Bytes(`${enrollmentNumber.trim()}-${semester.trim()}`)
  );
  console.log("Hash:", hash);
  return hash;
};

// Function to generate QR code data that can be used for verification
export const generateQrCodeData = (
  enrollmentNumber: string,
  semester: string
): string => {
  const hash = generateMarksheetHash(enrollmentNumber, semester);

  // Creating a verification URL that can be used to verify the marksheet authenticity
  // This URL can point to a verification page in your dApp
  return JSON.stringify({
    hash,
    enrollmentNumber,
    semester,
  });
};

// Function to store the marksheet hash in the blockchain
export const storeMarksheetHashOnBlockchain = async (
  contractInstance: any,
  enrollmentNumber: string,
  semester: string
): Promise<boolean> => {
  if (!contractInstance) {
    connectWallet();
    toast.error("Blockchain connection not available");

    return false;
  }

  try {
    // Generate the student ID and hash
    const studentId = `${enrollmentNumber}-${semester}`;
    const hash = generateMarksheetHash(enrollmentNumber, semester);

    // Store the hash on the blockchain
    const tx = await contractInstance.storeHash(studentId, hash);

    // Wait for the transaction to be mined
    await tx.wait();

    toast.success("Marksheet has been recorded on the blockchain");
    return true;
  } catch (error) {
    console.error("Error storing hash on blockchain:", error);
    toast.error("Failed to record marksheet on blockchain");
    return false;
  }
};

export const verifyHashFromBlockchain = async (
  enrollmentNumber: string,
  semesterNumber: string,
  backendHash: string
): Promise<boolean> => {
  console.log("INSIDE VERIFICATION FUNCTION");

  try {
    const provider = new ethers.JsonRpcProvider(PUBLIC_RPC_URL);

    // ✅ Connect to the contract
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      provider
    );

    // ✅ Generate the student ID correctly
    const studentId = `${enrollmentNumber.trim()}-${semesterNumber.trim()}`;

    // ✅ Fetch stored hash from blockchain

    const storedHash = await contract.getStoredHash(studentId);

    console.log("🔹 Stored Hash from Blockchain:", storedHash);
    console.log("🔹 Backend Hash from API:", backendHash);

    // ✅ Check if hash exists
    if (!storedHash || storedHash === "") {
      console.error("❌ No hash found on the blockchain!");
      toast.error("No hash found on the blockchain.");
      return false;
    }

    // ✅ Compare hashes correctly
    if (storedHash !== backendHash) {
      console.error("❌ Hashes do not match! Verification failed.");
      toast.error("Document verification failed.");
      return false;
    }

    console.log("✅ Marksheet verification successful!");
    toast.success("Marksheet verified successfully!");
    return true;
  } catch (error) {
    console.error("Error fetching hash from blockchain:", error);
    toast.error("Failed to retrieve hash from blockchain.");
    return false;
  }
};

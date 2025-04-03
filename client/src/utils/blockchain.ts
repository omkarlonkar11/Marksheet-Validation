import { ethers } from "ethers";
import { toast } from "react-hot-toast";

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

import { MetaMaskInpageProvider } from "@metamask/providers";
//import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("No Wallet Found, Install Metamask");
  }

  console.log("Connected to Metamask");

  const accounts: string[] = (await window.ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];

  console.log("Connected Account:" + accounts[0]);

  // const selectedAccount = accounts[0];
  // const provider = await new ethers.BrowserProvider(window.ethereum);
  // const signer = await provider.getSigner();
  // const contractAddress = "";
  //   const contractInstance = new ethers.Contract(
  //     contractAddress,
  //     //contractAbi ,
  //     signer
  //   );

  //return { contractInstance, selectedAccount };
};

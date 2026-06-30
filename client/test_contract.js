import { ethers } from "ethers";
import fs from "fs";

const contractAbi = JSON.parse(fs.readFileSync("./src/constants/ContractABI.json", "utf-8"));

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/43566bffdb114ef4b0047262fa4ba52d");
  const contract = new ethers.Contract("0x43704fE7Abd4A84d6a4D1e8B63d1910a795080F7", contractAbi, provider);

  try {
    const res = await contract.batchGetStoredHashes(["test-1"]);
    console.log("Success:", res);
  } catch (error) {
    console.error("Error:", error.message || error);
  }
}
main();

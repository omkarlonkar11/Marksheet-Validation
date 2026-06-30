import { ethers } from "ethers";
import fs from "fs";

const contractAbi = JSON.parse(fs.readFileSync("./src/constants/ContractABI.json", "utf-8"));

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/43566bffdb114ef4b0047262fa4ba52d");
  const contract = new ethers.Contract("0xB744165EBFF0336bFDA48b9B82b703dee8F39d30", contractAbi, provider);

  try {
    const owner = await contract.owner();
    console.log("Owner is:", owner);
  } catch (error) {
    console.error("Error:", error.message || error);
  }
}
main();

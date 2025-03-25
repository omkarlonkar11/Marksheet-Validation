import { connectWallet } from "../utils/ConnectWallet";

function Wallet() {
  return (
    <button
      className="text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
      onClick={connectWallet}>
      Connect Wallet
    </button>
  );
}

export default Wallet;

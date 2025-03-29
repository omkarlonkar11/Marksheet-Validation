import { useWeb3Context } from "../contexts/Web3Context";
import { connectWallet } from "../utils/ConnectWallet";

function Wallet() {
  const { web3State, updateWeb3State } = useWeb3Context();

  const handleWalletConnection = async () => {
    console.log("Button Clicked: Connecting Wallet...");
    const walletData = await connectWallet(); // walletData could be undefined
    console.log(walletData);
    if (!walletData) {
      console.error("Wallet connection failed or user rejected request.");
      return;
    }

    const { contractInstance, selectedAccount } = walletData;
    //console.log(contractInstance, selectedAccount);
    await updateWeb3State({
      contractInstance: contractInstance,
      selectedAccount: selectedAccount,
    });
    console.log("In wallet : ");
    console.log(web3State.contractInstance);
    console.log(web3State.selectedAccount);
  };

  return (
    <button
      className="text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
      onClick={handleWalletConnection}>
      Connect Wallet
    </button>
  );
}

export default Wallet;

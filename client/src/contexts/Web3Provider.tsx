import { useState, ReactNode } from "react";
import { Web3Context } from "./createWeb3Context";

interface Web3State {
  contractInstance: any; // Replace 'any' with the actual contract type if known
  selectedAccount: string | null;
}

interface Web3ProviderProps {
  children: ReactNode;
}

const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [web3State, setWeb3State] = useState<Web3State>({
    contractInstance: null,
    selectedAccount: null,
  });

  const updateWeb3State = (newState: Partial<Web3State>) => {
    setWeb3State((prevState) => ({
      ...prevState,
      ...newState,
    }));
  };

  return (
    <Web3Context.Provider value={{ web3State, updateWeb3State }}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;

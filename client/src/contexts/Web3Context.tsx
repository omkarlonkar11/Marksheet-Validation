import { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of Web3State
interface Web3State {
  contractInstance: any | null;
  selectedAccount: string | null;
}

// Define the shape of the Context
interface Web3ContextType {
  web3State: Web3State;
  updateWeb3State: (newState: Partial<Web3State>) => void;
}

// Create the context
const Web3Context = createContext<Web3ContextType | null>(null);

// Web3Provider Component
export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [web3State, setWeb3State] = useState<Web3State>({
    contractInstance: null,
    selectedAccount: null,
  });

  // Function to update Web3State
  const updateWeb3State = (newState: Partial<Web3State>) => {
    setWeb3State((prevState) => ({ ...prevState, ...newState }));
  };

  return (
    <Web3Context.Provider value={{ web3State, updateWeb3State }}>
      {children}
    </Web3Context.Provider>
  );
};

// Custom Hook to use Web3Context
export const useWeb3Context = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3Context must be used within a Web3Provider");
  }
  return context;
};

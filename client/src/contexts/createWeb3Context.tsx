import { createContext } from "react";

interface Web3State {
  contractInstance: any;
  selectedAccount: string | null;
}

interface Web3ContextType {
  web3State: Web3State;
  updateWeb3State: (newState: Partial<Web3State>) => void;
}

export const Web3Context = createContext<Web3ContextType | undefined>(
  undefined
);

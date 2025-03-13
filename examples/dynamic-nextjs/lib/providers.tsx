"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      theme="auto"
      settings={{
        environmentId: "c45837f2-68a5-4e36-9183-f2de1bf73547",
        walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}

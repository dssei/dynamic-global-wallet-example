"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      theme="auto"
      settings={{
        environmentId: "f981dab3-486c-4fd9-8e35-0a3cc32f263d",
        walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors, ZeroDevSmartWalletConnectors],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}

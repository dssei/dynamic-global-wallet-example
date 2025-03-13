import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";

// import '@sei-js/sei-account/eip6963';

function App() {
  return (
    <DynamicContextProvider
      theme="auto"
      settings={{
        environmentId: "c45837f2-68a5-4e36-9183-f2de1bf73547",
        walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
      }}
    >
      <DynamicWidget />
    </DynamicContextProvider>
  );
}

export default App;

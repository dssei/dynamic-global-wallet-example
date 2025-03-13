import { FC, PropsWithChildren, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { WagmiProvider, createConfig, http } from "wagmi";
import { seiTestnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ConnectKitButton,
  ConnectKitProvider,
  getDefaultConfig,
} from "connectkit";

// import "@sei-js/sei-account/eip6963";

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [seiTestnet],
    transports: {
      // RPC URL for each chain
      [seiTestnet.id]: http(),
    },

    // Required API Keys
    walletConnectProjectId: "9e559740664b49ec6bdaec33fdb7232c",

    // Required App Info
    appName: "Your App Name",

    // Optional App Info
    appDescription: "Your App Description",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const queryClient = new QueryClient();

export const Web3Provider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Web3Provider>
      <ConnectKitButton />
    </Web3Provider>
  </StrictMode>
);

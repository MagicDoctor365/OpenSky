"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import {
  mainnet,
  sepolia,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
  hardhat,
} from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function WrapApp({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();

  const config = getDefaultConfig({
    appName: "My RainbowKit App",
    projectId: "YOUR_PROJECT_ID",
    chains: [
      mainnet,
      polygon,
      optimism,
      arbitrum,
      base,
      zora,
      hardhat,
      // ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia, anvil] : [])
    ],
    ssr: true,
    // [mainnet.chainId]: [infu],
    // [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/'),
  });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider showRecentTransactions={true}>
          <Header />
          {children}
          <Footer />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

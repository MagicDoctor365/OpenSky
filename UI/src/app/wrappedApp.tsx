"use client";

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  mainnet,
  sepolia,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
  anvil,
} from 'wagmi/chains';
import { http, WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import type { AppProps } from "next/app";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function WrappedApp({ children }: Readonly<{
    children: React.ReactNode;
  }>) {
  const queryClient = new QueryClient();

  const config = getDefaultConfig({
    appName: 'My RainbowKit App',
    projectId: 'YOUR_PROJECT_ID',
    chains: [mainnet, polygon, optimism, arbitrum, base, zora, anvil
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
  )
}

"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { notification, message } from "antd";
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
import { createContext } from "react";
import { NotificationInstance } from "antd/es/notification/interface";
import { MessageInstance } from "antd/es/message/interface";

interface ContextValue {
  notificationApi: NotificationInstance | null;
  messageApi: MessageInstance | null;
}
export const Context = createContext({
  notificationApi: null,
  messageApi: null,
} as ContextValue);

export default function WrapApp({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [notificationApi, notificationContextHolder] =
    notification.useNotification();
  const [messageApi, messageContextHolder] = message.useMessage();

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
          <Context.Provider
            value={{ notificationApi: notificationApi, messageApi: messageApi }}
          >
            <Header />
            {notificationContextHolder}
            {messageContextHolder}
            {children}
            <Footer />
          </Context.Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

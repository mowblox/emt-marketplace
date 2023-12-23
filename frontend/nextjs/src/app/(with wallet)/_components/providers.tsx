"use client";
import React, { use, useEffect, useState } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { GetSiweMessageOptions, RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import { chain, emtChains, emtWagmiConfig } from "@/../emt.config"
import { WagmiConfig } from 'wagmi';
import { ContractProvider } from '@/lib/hooks/useContracts';
import { UserProvider } from '@/lib/hooks/user';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const queryClient = new QueryClient({
  defaultOptions:{
    queries:{
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    }
  }
});


// Web3 Wallet Connector's Provider
export default function DappProviders({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: @Jovells persist Signupdata lo localstorage

  return (
      <QueryClientProvider client={queryClient}> 
    <WagmiConfig config={emtWagmiConfig}>
      <RainbowKitSiweNextAuthProvider >
      <RainbowKitProvider initialChain={chain}  chains={emtChains} theme={darkTheme({
        accentColorForeground: 'white',
        
        accentColor: '#5957e9',
      })} >
        <ContractProvider>
          <UserProvider>
          {children}
          </UserProvider>
        </ContractProvider>
      </RainbowKitProvider>
      </RainbowKitSiweNextAuthProvider>
    </WagmiConfig>
      </QueryClientProvider>
  )
}

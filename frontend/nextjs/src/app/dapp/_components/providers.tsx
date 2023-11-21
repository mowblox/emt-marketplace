"use client";
import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import { emtChains, emtWagmiConfig } from "../../../../emt.config"
import { WagmiConfig } from 'wagmi';
import { ContractProvider } from '@/lib/hooks/contracts';
import { UserProvider } from '@/lib/hooks/user';

// Web3 Wallet Connector's Provider
export default function DappProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WagmiConfig config={emtWagmiConfig}>
      <RainbowKitSiweNextAuthProvider >
      <RainbowKitProvider chains={emtChains} theme={darkTheme({
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
  )
}

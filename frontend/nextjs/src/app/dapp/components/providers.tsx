"use client";
import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';

import { emtChains, emtWagmiConfig } from "../../../../emt.config"
import { WagmiConfig } from 'wagmi';
import { ContractProvider } from '@/lib/hooks/contracts';

// Web3 Wallet Connector's Provider
export default function DappProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WagmiConfig config={emtWagmiConfig}>
      <RainbowKitProvider chains={emtChains} theme={darkTheme({
        accentColorForeground: 'white',
        
        accentColor: '#5957e9',
      })} >
        <ContractProvider>
          {children}
        </ContractProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

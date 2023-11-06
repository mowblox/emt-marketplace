"use client";
import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  ConnectButton,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';

import {emtChains, emtWagmiConfig} from "./../../../emt.config"
import { WagmiConfig } from 'wagmi';
import { ContractProvider } from '@/lib/hooks/contracts';




export default function DappLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
        <WagmiConfig config={emtWagmiConfig}>
        <RainbowKitProvider chains={emtChains}>
          <ContractProvider>
        <header>
            <ConnectButton/>
        </header>
        {children}
        </ContractProvider>
        </RainbowKitProvider>
    </WagmiConfig>
  
    )
  }

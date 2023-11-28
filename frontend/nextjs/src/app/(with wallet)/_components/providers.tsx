"use client";
import React, { use, useEffect, useState } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { GetSiweMessageOptions, RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import { emtChains, emtWagmiConfig } from "../../../../emt.config"
import { WagmiConfig } from 'wagmi';
import { ContractProvider } from '@/lib/hooks/contracts';
import { UserProvider } from '@/lib/hooks/user';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SignUpData } from '@/lib/types';
import { useSession } from "next-auth/react";
import useBackend from '@/lib/hooks/useBackend';
import { uploadImage } from '@/lib/hooks/useBackend';

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
  // TODO: @Jovells persist Signupdata lo loaclstorage
  
  const signUpDataRef = React.useRef<SignUpData>({});
  const {data: session, update }: {data: any, update: any}= useSession();
  console.log('signUpData', signUpDataRef.current)
  
  const getSiweMessageOptions: GetSiweMessageOptions = () => { 
    if (!signUpDataRef.current?.username) {
      return {}
    }
    const _data = {...signUpDataRef.current};
    delete _data.profilePicture;

    const data = JSON.stringify(_data)
    console.log('d',_data)
    return {resources: [data]}
  };


  return (
      <QueryClientProvider client={queryClient}> 
    <WagmiConfig config={emtWagmiConfig}>
      <RainbowKitSiweNextAuthProvider getSiweMessageOptions = {getSiweMessageOptions} >
      <RainbowKitProvider  chains={emtChains} theme={darkTheme({
        accentColorForeground: 'white',
        
        accentColor: '#5957e9',
      })} >
        <ContractProvider>
          <UserProvider signUpDataRef = {signUpDataRef}>
          {children}
          </UserProvider>
        </ContractProvider>
      </RainbowKitProvider>
      </RainbowKitSiweNextAuthProvider>
    </WagmiConfig>
      </QueryClientProvider>
  )
}

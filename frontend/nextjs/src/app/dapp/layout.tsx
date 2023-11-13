"use client";
import React from 'react';
// import { Metadata } from 'next'
import '@rainbow-me/rainbowkit/styles.css';
import {
  ConnectButton,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';

import { emtChains, emtWagmiConfig } from "./../../../emt.config"
import { WagmiConfig } from 'wagmi';
import { ContractProvider } from '@/lib/hooks/contracts';
import { Sidebar } from './components/sidebar';

// export const metadata: Metadata = {
//   title: 'Dapp View | Not Signed In',
// }

export default function DappLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <WagmiConfig config={emtWagmiConfig}>
        <RainbowKitProvider chains={emtChains}>
          <ContractProvider>
            <header>
              <div className=" flex-col md:flex">
                <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
                  <h2 className="text-lg font-semibold">MEMM!</h2>
                  <div className="ml-auto flex w-full space-x-2 sm:justify-end">
                    <ConnectButton />
                  </div>
                </div>
              </div>
            </header>

            <div className="blankk">
              <div className="border-t">
                <div className="bg-background">
                  <div className="grid lg:grid-cols-5">
                    <Sidebar className="hidden lg:block" />
                    <div className="col-span-3 lg:col-span-4 lg:border-l">
                      <div className="h-full px-4 py-6 lg:px-8">
                        {children}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </ContractProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  )
}

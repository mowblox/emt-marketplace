
import React from 'react';
import { Metadata } from 'next'
import '@rainbow-me/rainbowkit/styles.css';
import DappProviders from './_components/providers';
import SessionProvider from "@/lib/hooks/sessionProvider";
import { getServerSession } from "next-auth";


export const metadata: Metadata = {
  title: 'MEMM! Homepage',
}

type Props = {
  children: React.ReactNode
}

export default async function DappLayout({
  children
}: Props) {
  const session = await getServerSession();

  return (
    <>
    <SessionProvider refetchInterval={0} session={session}>
      <DappProviders>
        {children}
      </DappProviders>
      </SessionProvider>
    </>
  )
}

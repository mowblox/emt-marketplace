
import React, {useState} from 'react';
import { Metadata } from 'next'
import '@rainbow-me/rainbowkit/styles.css';
import {
  ConnectButton
} from '@rainbow-me/rainbowkit';
import { Sidebar } from '../_components/sidebar';
import { Button } from '@/components/ui/button';
import { HiOutlinePencilAlt } from "react-icons/hi"
import { HiBars3, HiMagnifyingGlass } from "react-icons/hi2"
import DappProviders from '../_components/providers';
import SessionProvider from "@/lib/hooks/sessionProvider";
import { getServerSession } from "next-auth";
import {Navbar} from "../_components/navbar"
import { SignInButton } from '../_components/signInButton';

export const metadata: Metadata = {
  title: 'MEMM! Homepage',
}

type Props = {
  children: React.ReactNode
}

export default async function DappLayout({
  children
}: Props) {

  return (
    <>
        <Navbar />
        <div className="body">
          <div className="border-t">
            <div className="bg-background">
              <div className="grid lg:grid-cols-5">
                <Sidebar className="hidden lg:block min-h-[94vh]" />
                <div className="col-span-4 lg:col-span-4">
                  {children}
                </div>

              </div>
            </div>
          </div>
        </div>
    </>
  )
}

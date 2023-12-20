
import {getDefaultWallets} from "@rainbow-me/rainbowkit";
import { LucideImport } from "lucide-react";
  import { configureChains, createConfig } from 'wagmi';
  import {
  hardhat,
  } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';


import { Chain } from 'wagmi'
import { collection } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { JsonRpcProvider, ethers } from "ethers6";
import { EMTMarketplace as EMTMarketplaceType } from "../../blockchain/typechain-types/contracts/EMTMarketplace";
import { ExpertToken as ExpertTokenType } from "../../blockchain/typechain-types/contracts/ExpertToken";
import { MentorToken as MentorTokenType } from "../../blockchain/typechain-types/contracts/MentorToken";
import { StableCoin as StableCoinType } from "../../blockchain/typechain-types/contracts/StableCoin";

import {chain, envChains} from './contracts'

 const { chains, publicClient } = configureChains(
  envChains,
    [
      publicProvider()
    ]
  );
  
 const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    //todo: @od41 add walletconnect project id in Vercel
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
    chains
  });
  
 const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient
  })

  export const emtChains = chains
  export const emtWagmiConfig = wagmiConfig
  export {chain}


  export const USERS_COLLECTION = collection(firestore, 'users');
  export const NOTIFICATIONS_COLLECTION = process.env.NODE_ENV === "production"? collection(firestore, 'notifications') : collection(firestore, 'dev', String(process.env.NEXT_PUBLIC_DEV!) + chain.id , 'notifications');
  export const CLAIM_HISTORY_COLLECTION = process.env.NODE_ENV === "production"? collection(firestore, 'claimHistory') : collection(firestore, 'dev', String(process.env.NEXT_PUBLIC_DEV!) + chain.id , 'claimHistory');
  export const CONTENTS_COLLECTION = process.env.NODE_ENV === "production"? collection(firestore, 'contents') : collection(firestore, 'dev', String(process.env.NEXT_PUBLIC_DEV!) + chain.id, 'contents');
  export const EXPT_LISTINGS_COLLECTION = process.env.NODE_ENV === "production"? collection(firestore, 'exptListings') : collection(firestore, 'dev', String(process.env.NEXT_PUBLIC_DEV!) + chain.id, 'exptListings');
  export const BOOKINGS_COLLECTION = process.env.NODE_ENV === "production"? collection(firestore, 'bookings') : collection(firestore, 'dev', String(process.env.NEXT_PUBLIC_DEV!) + chain.id, 'bookings');
  export const ADMIN_COLLECTION = process.env.NODE_ENV === "production"? collection(firestore, 'admin') : collection(firestore, 'dev', String(process.env.NEXT_PUBLIC_DEV!) + chain.id, 'admin');
 
export const exptLevelKeys = [1, 2, 3]

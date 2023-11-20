"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers6";
import { chain } from "../../../emt.config";
import {EMTMarketplace} from "../../../../../blockchain/typechain-types/contracts/EMTMarketplace";
import {ExpertToken} from "../../../../../blockchain/typechain-types/contracts/ExpertToken";
import {MentorToken} from "../../../../../blockchain/typechain-types/contracts/MentorToken";
import {
    useConnectModal,
    useAccountModal,
    useChainModal,
  } from '@rainbow-me/rainbowkit';
import {useAccount} from "wagmi"
import PageLoading from "@/components/ui/page-loading";

interface ContractContext {
  EMTMarketPlace: EMTMarketplace;
  ExpertToken: ExpertToken;
  MentorToken: MentorToken;
}

declare global {
    interface Window {
      ethereum: any;
    }
  }

const ContractContext = createContext<ContractContext | null>(null);

export function useContracts(): ContractContext{
  const contractContext = useContext(ContractContext);

  if (!contractContext) {
    throw new Error("Contract context is not available");
  }


  return contractContext;
}

export function ContractProvider({ children }: { children: React.ReactNode }) {
    const {openChainModal} = useChainModal()
    const account = useAccount()

  const [contracts, setContracts] = useState<ContractContext | null>(null);
  


  useEffect(() => {
    if (typeof window == "undefined") {
      return;
    }
   
    async function fetchContracts() {
    const provider = new ethers.BrowserProvider(window.ethereum);



      const EMTMarketPlace_ = require(`@/deployments/${chain.id}/EMTMarketplace.js`).default;

      const ExpertToken_ = require(`@/deployments/${chain.id}/ExpertToken.js`).default;

      const MentorToken_ = require(`@/deployments/${chain.id}/MentorToken.js`).default;


      ethers.ContractFactory

      const EMTMarketPlace = new ethers.Contract(EMTMarketPlace_.address, EMTMarketPlace_.abi, provider) as unknown as EMTMarketplace ;
      const ExpertToken = new ethers.Contract(ExpertToken_.address, ExpertToken_.abi, provider)  as unknown as ExpertToken ;
      const MentorToken = new ethers.Contract(MentorToken_.address, MentorToken_.abi, provider)  as unknown as MentorToken;

      setContracts({
        EMTMarketPlace,
        ExpertToken,
        MentorToken,
      });
    }

    fetchContracts();
  }, []);

  if (!contracts) {
    return <div><PageLoading /></div>;
  }

  return (
    <ContractContext.Provider value={contracts}>{children}</ContractContext.Provider>
  );
}

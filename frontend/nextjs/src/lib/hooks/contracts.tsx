
/**
 * This file contains the implementation of the ContractProvider and useContracts hooks,
 * which provide access to the Ethereum smart contracts used in the application.
 */

"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { BrowserProvider, JsonRpcProvider, ethers } from "ethers6";
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

/**
 * The context interface that defines the contract context object.
 */
interface ContractContext {
  EMTMarketPlace: EMTMarketplace;
  ExpertToken: ExpertToken;
  MentorToken: MentorToken;
  provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
}


declare global {
    interface Window {
      ethereum: any;
    }
  }

/**
 * The context object that holds the contract instances and provider.
 */
const ContractContext = createContext<ContractContext | null>(null);

/**
 * A custom hook that provides access to the contract context.
 * @returns The contracts context object.
 * @throws Error if the contract context is not available.
 */
export function useContracts(): ContractContext{
  const contractContext = useContext(ContractContext);

  if (!contractContext) {
    throw new Error("Contract context is not available");
  }

  return contractContext;
}

/**
 * A component that wraps the application and provides the contracts context.
 * @param children - The child components.
 * @returns The ContractProvider component.
 */
export function ContractProvider({ children }: { children: React.ReactNode }) {
    const {openChainModal} = useChainModal()
    const account = useAccount();
    
  const [contracts, setContracts] = useState<ContractContext | null>(null);
  
  useEffect(() => {
    if (typeof window == "undefined") {
      return;
    }
   
    async function fetchContracts() {
      let provider: JsonRpcProvider | BrowserProvider
      if(window.ethereum){
         provider = new ethers.BrowserProvider(window.ethereum);
      }
      else{
        provider = new JsonRpcProvider(chain.rpcUrls.default.http[0]);
      }

      const EMTMarketPlace_ = require(`@/deployments/${chain.id}/EMTMarketplace.js`).default;
      const ExpertToken_ = require(`@/deployments/${chain.id}/ExpertToken.js`).default;
      const MentorToken_ = require(`@/deployments/${chain.id}/MentorToken.js`).default;

      const EMTMarketPlace = new ethers.Contract(EMTMarketPlace_.address, EMTMarketPlace_.abi, provider) as unknown as EMTMarketplace ;
      const ExpertToken = new ethers.Contract(ExpertToken_.address, ExpertToken_.abi, provider)  as unknown as ExpertToken ;
      const MentorToken = new ethers.Contract(MentorToken_.address, MentorToken_.abi, provider)  as unknown as MentorToken;

      setContracts({
        EMTMarketPlace,
        ExpertToken,
        MentorToken,
        provider,
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

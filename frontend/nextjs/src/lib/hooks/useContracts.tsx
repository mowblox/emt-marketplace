/**
 * This file contains the implementation of the ContractProvider and useContracts hooks,
 * which provide access to the Ethereum smart contracts used in the application.
 */

"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { BrowserProvider, JsonRpcProvider, ethers } from "ethers6";
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import PageLoading from "@/components/ui/page-loading";
import { chain } from "../../../contracts";
import {
  provider as _provider,
  emtMarketplace as _emtMarketPlace,
  mentorToken as _mentorToken,
  stableCoin as _stableCoin,
  expertToken as _expertToken,
} from "@/../../contracts";

/**
 * The context interface that defines the contract context object.
 */
declare global {
  interface Window {
    ethereum: any;
  }
}

type ContractContext = {
  emtMarketplace: typeof _emtMarketPlace;
  expertToken: typeof _expertToken;
  mentorToken: typeof _mentorToken;
  stableCoin: typeof _stableCoin;
  provider: JsonRpcProvider | BrowserProvider;
  network: ethers.Network | null | undefined;
  signer: ethers.Signer | null | undefined;
};
/**
 * The context object that holds the contract instances and provider.
 */
const ContractContext = createContext<ContractContext>({
  emtMarketplace: _emtMarketPlace,
  expertToken: _expertToken,
  mentorToken: _mentorToken,
  stableCoin: _stableCoin,
  provider: _provider,
  signer: null,
  network: null,
});

/**
 * A custom hook that provides access to the contract context.
 * @returns The contracts context object.
 * @throws Error if the contract context is not available.
 */
export function useContracts() {
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
  let ethereum: any = undefined;
  const { openChainModal } = useChainModal();
  const account = useAccount();

  const [contracts, setContracts] = useState<ContractContext>({
    emtMarketplace: _emtMarketPlace,
    expertToken: _expertToken,
    mentorToken: _mentorToken,
    stableCoin: _stableCoin,
    provider: _provider,
    signer: null,
    network: null,
  });
  const {
    emtMarketplace,
    expertToken,
    mentorToken,
    provider,
    stableCoin,
    network,
  } = contracts;
  console.log("contracts", contracts);

  if (typeof window != "undefined") {
    ethereum = window.ethereum;
  }

  useEffect(() => {
    if (typeof window == "undefined") {
      return;
    }

    async function fetchContracts() {
      let _signer: ethers.Signer | undefined;
      const _network = await provider.getNetwork();
      if (ethereum) {
        let _provider = new ethers.BrowserProvider(ethereum);
        _signer = await _provider.getSigner();
        //TODO: INFO @Jovells @od41 @mickeymond INFO: This is for testing purposes only
        //can be used to mint stablecoins from browser console
        //MUST be removed when we go live
        //@ts-ignore
        window.signer = _signer;
        //@ts-ignore
        window.adminSigner = new ethers.Wallet(
          // @ts-ignore
          process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY,
          provider
        );
        //@ts-ignore
        window.stableCoin = stableCoin;
        //@ts-ignore
        window.emtMarketplace = emtMarketplace;
        //@ts-ignore
        window.expertToken = expertToken;
        //@ts-ignore
        window.mentorToken = mentorToken;
        
        setContracts({
          emtMarketplace: emtMarketplace.connect(_signer),
          expertToken: expertToken.connect(_signer),
          mentorToken: mentorToken.connect(_signer),
          stableCoin: stableCoin.connect(_signer),
          provider: _provider,
          network: _network,
          signer: _signer,
        });
      } else {
        setContracts({ ...contracts, network: network });
      }
    }

    fetchContracts();
  }, [ethereum, chain.id, account.address, network?.chainId]);

  if (!contracts) {
    return (
      <div>
        <PageLoading />
      </div>
    );
  }

  return (
    <ContractContext.Provider value={contracts}>
      {children}
    </ContractContext.Provider>
  );
}

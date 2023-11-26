import {getDefaultWallets} from "@rainbow-me/rainbowkit";
import { LucideImport } from "lucide-react";
  import { configureChains, createConfig } from 'wagmi';
  import {
  hardhat, mainnet, polygonMumbai
  } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

/* TODO: define topos chains
https://wagmi.sh/react/chains#build-your-own
 const topos...
 */

 const productionChain = polygonMumbai /*TODO: use topos */

 const envChains = process.env.NODE_ENV === "production" ? [productionChain] : [hardhat, productionChain, /*TODO: add topos */]

 const { chains, publicClient } = configureChains(
  envChains,
    [
      publicProvider()
    ]
  );
  
 const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    projectId: 'YOUR_PROJECT_ID',
    chains
  });
  
 const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient
  })

  export const emtChains = chains
  export const emtWagmiConfig = wagmiConfig

  export const chain = process.env.NODE_ENV === "production" ? productionChain : hardhat
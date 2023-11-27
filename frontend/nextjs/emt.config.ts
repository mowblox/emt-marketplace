import {getDefaultWallets} from "@rainbow-me/rainbowkit";
import { LucideImport } from "lucide-react";
  import { configureChains, createConfig } from 'wagmi';
  import {
  hardhat, mainnet, polygonMumbai
  } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';


 import { Chain } from 'wagmi'
/* TODO: @mickeymond define topos chain
ref: https://wagmi.sh/react/chains#build-your-own

export const toposTestnet = {
  id: 43_114,
  name: 'Avalanche',
  network: 'avalanche',
  nativeCurrency: {
    decimals: 18,
    name: 'Avalanche',
    symbol: 'AVAX',
  },
  rpcUrls: {
    public: { http: ['https://api.avax.network/ext/bc/C/rpc'] },
    default: { http: ['https://api.avax.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    etherscan: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 11_907_934,
    },
  },
} as const satisfies Chain

const toposMainnet = {...} as const satisfies Chain
*/

//TODO: @mickeymond deploy contacts to topos testnet


 const productionChain = polygonMumbai /*TODO: @Jovells use topos */

 const envChains = process.env.NODE_ENV === "production" ? [productionChain] : [hardhat, productionChain, /*TODO: @Jovells add topos */]

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
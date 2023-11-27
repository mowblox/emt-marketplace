
import {getDefaultWallets} from "@rainbow-me/rainbowkit";
import { LucideImport } from "lucide-react";
  import { configureChains, createConfig } from 'wagmi';
  import {
  hardhat, mainnet, polygonMumbai
  } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';


 import { Chain } from 'wagmi'

export const toposTestnet = {
  id: 2359,
  name: 'Topos Subnet',
  network: 'topos',
  nativeCurrency: {
    decimals: 18,
    name: 'TOPOS',
    symbol: 'TOPOS',
  },
  rpcUrls: {
    public: { http: ['https://rpc.topos-subnet.testnet-1.topos.technology'] },
    default: { http: ['https://rpc.topos-subnet.testnet-1.topos.technology'] },
  },
  blockExplorers: {
    etherscan: { name: 'Blockscout', url: 'https://topos.blockscout.testnet-1.topos.technology' },
    default: { name: 'Blockscout', url: 'https://topos.blockscout.testnet-1.topos.technology' },
  },
  // contracts: {
  //   multicall3: {
  //     address: '0xca11bde05977b3631167028862be2a173976ca11',
  //     blockCreated: 11_907_934,
  //   },
  // },
} as const satisfies Chain 



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

  export const chain = process.env.NODE_ENV === "production" ? productionChain : hardhat
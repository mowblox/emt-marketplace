
import { JsonRpcProvider, ethers } from "ethers6";
import {EMTMarketplace} from "@/../../../blockchain/typechain-types/contracts/EMTMarketplace";
import {ExpertToken} from "@/../../../blockchain/typechain-types/contracts/ExpertToken";
import {MentorToken} from "@/../../../blockchain/typechain-types/contracts/MentorToken";
import {StableCoin} from "@/../../../blockchain/typechain-types/contracts/StableCoin";
import {hardhat} from 'viem/chains'

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
  } as const
  
  
export const productionChain = toposTestnet 

export const envChains = process.env.NODE_ENV === "production" ? [productionChain] : [hardhat, productionChain]
export const chain = process.env.NODE_ENV === "production" ? productionChain : envChains.find(c => c.id == parseInt(process.env.NEXT_PUBLIC_DEVCHAIN!)) || hardhat
const chainId = chain.id
export const provider = new JsonRpcProvider(chain.rpcUrls.default.http[0]);
export const emtMarketplace_ = require(`@/deployments/${chainId}/EMTMarketplace.js`).default;
export const expertToken_ = require(`@/deployments/${chainId}/ExpertToken.js`).default;
export const mentorToken_ = require(`@/deployments/${chainId}/MentorToken.js`).default;
export const stableCoin_ = require(`@/deployments/${chainId}/StableCoin.js`).default;
export const emtMarketplace = new ethers.Contract(emtMarketplace_.address, emtMarketplace_.abi, provider) as unknown as EMTMarketplace ;
export const expertToken = new ethers.Contract(expertToken_.address, expertToken_.abi, provider)  as unknown as ExpertToken ;
export const mentorToken = new ethers.Contract(mentorToken_.address, mentorToken_.abi, provider)  as unknown as MentorToken;
export const stableCoin = new ethers.Contract(stableCoin_.address, stableCoin_.abi, provider)  as unknown as StableCoin;
      

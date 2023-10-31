const { getDefaultWallets } = require("@rainbow-me/rainbowkit");
  import { configureChains, createConfig } from 'wagmi';
  import {
  hardhat, mainnet
  } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

/* @todo: define topos chains
https://wagmi.sh/react/chains#build-your-own
 const topos...
 */

 const { chains, publicClient } = configureChains(
    [hardhat,
    mainnet
    // @todo: add topos chain
    ],
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
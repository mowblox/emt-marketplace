import { HardhatUserConfig } from "hardhat/config";
import crypto from "crypto";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    topos: {
      url: 'https://rpc.topos-subnet.testnet-1.topos.technology',
      accounts: [process.env.PRIVATE_KEY as string || crypto.randomBytes(32).toString('hex')]
    },
    incal: {
      url: 'https://rpc.incal.testnet-1.topos.technology',
      accounts: [process.env.PRIVATE_KEY as string || crypto.randomBytes(32).toString('hex')]
    }
  },
  gasReporter: {
    enabled: true
  }
};

export default config;

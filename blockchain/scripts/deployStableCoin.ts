import { ethers } from "hardhat";
import dotenv from "dotenv";

const generateAbis = require('./generateAbis');

dotenv.config();

// TODO @jovells update deploy script to include this action

async function main() {
  const [owner] = await ethers.getSigners();
  const defaultAdmin = process.env.TOKEN_DEFAULT_ADMIN || owner.address;

  // Deploy Marketplace Contract
  const stableCoin = await ethers.deployContract("StableCoin", ['Mock Tether', 'USDT', defaultAdmin]);
  stableCoin.waitForDeployment();
  console.log("Stable Coin deployed at: ", stableCoin.target);

  //mint stable coin to deployer
  stableCoin.mint(defaultAdmin, 1_000_000 * 10 ** 6)

  
  //Generate files containining Abis and contract addresses for use in frontend
  const chainId = (await ethers.provider.getNetwork()).chainId;
  generateAbis(chainId, {
    StableCoin: stableCoin.target
  })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { ethers, upgrades } from "hardhat";
import dotenv from "dotenv";

const generateAbis = require('./generateAbis');

dotenv.config();

async function main() {
  // const [owner] = await ethers.getSigners();
  // const defaultAdmin = process.env.TOKEN_DEFAULT_ADMIN || owner.address;

  // Deploy Marketplace Contract
  const EMTMarketplace = await ethers.getContractFactory("EMTMarketplace");
  const emtMarketplace = await upgrades.upgradeProxy((process.env.EMT_MARKETPLACE_ADDRESS as string), EMTMarketplace);
  await emtMarketplace.waitForDeployment();
  console.log("EMT Marketplace deployed at: ", emtMarketplace.target);

  // const minter = process.env.TOKEN_MINTER || emtMarketplace.target;

  // Deploy Mentor Token
  const MentorToken = await ethers.getContractFactory("MentorToken");
  const mentorToken = await upgrades.upgradeProxy((process.env.MENTOR_TOKEN_ADDRESS as string), MentorToken);
  await mentorToken.waitForDeployment();
  console.log("Mentor Token deployed at: ", mentorToken.target);

  // Deploy Expert Token
  const ExpertToken = await ethers.getContractFactory("ExpertToken");
  const expertToken = await upgrades.upgradeProxy((process.env.EXPERT_TOKEN_ADDRESS as string), ExpertToken);
  await expertToken.waitForDeployment();
  console.log("Expert Token deployed at: ", expertToken.target);

  // Deploy Stablecoin
  const StableCoin = await ethers.getContractFactory("StableCoin");
  const stableCoin = await upgrades.upgradeProxy((process.env.STABLECOIN_ADDRESS as string), StableCoin);
  await stableCoin.waitForDeployment();
  console.log("Stablecoin deployed at: ", stableCoin.target);

  const chainId = (await ethers.provider.getNetwork()).chainId;
  //Generate files containining Abis and contract addresses for use in frontend
  generateAbis(chainId, {
    EMTMarketplace: emtMarketplace.target,
    MentorToken: mentorToken.target,
    ExpertToken: expertToken.target,
    StableCoin: stableCoin.target
  })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

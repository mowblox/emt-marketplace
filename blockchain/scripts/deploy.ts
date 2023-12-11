import { ethers, upgrades } from "hardhat";
import dotenv from "dotenv";

const generateAbis = require('./generateAbis');

dotenv.config();

async function main() {
  const [owner] = await ethers.getSigners();
  const defaultAdmin = process.env.TOKEN_DEFAULT_ADMIN || owner.address;

  // Deploy Marketplace Contract
  const EMTMarketplace = await ethers.getContractFactory("EMTMarketplace");
  const emtMarketplace = await upgrades.deployProxy(EMTMarketplace, [defaultAdmin]);
  await emtMarketplace.waitForDeployment();
  console.log("EMT Marketplace deployed at: ", emtMarketplace.target);

  const minter = process.env.TOKEN_MINTER || emtMarketplace.target;

  // Deploy Mentor Token
  const MentorToken = await ethers.getContractFactory("MentorToken");
  const mentorToken = await upgrades.deployProxy(MentorToken, [defaultAdmin, minter]);
  await mentorToken.waitForDeployment();
  console.log("Mentor Token deployed at: ", mentorToken.target);

  // Deploy Expert Token
  const ExpertToken = await ethers.getContractFactory("ExpertToken");
  const expertToken = await upgrades.deployProxy(ExpertToken, [defaultAdmin, minter]);
  await expertToken.waitForDeployment();
  console.log("Expert Token deployed at: ", expertToken.target);

  // Deploy Stablecoin
  const StableCoin = await ethers.getContractFactory("StableCoin");
  const stableCoin = await upgrades.deployProxy(StableCoin, ["StableCoin", "SBC", defaultAdmin]);
  await stableCoin.waitForDeployment();
  console.log("Stablecoin deployed at: ", stableCoin.target);

  // Set MENT & EXPT token addresses
  console.log("Setting MENT & EXPT Token Addresses!");
  await (await emtMarketplace.setTokenAddresses(mentorToken.target, expertToken.target)).wait();
  console.log("Done Setting MENT & EXPT Token Addresses!")
  // Initialize all EXPT levels
  console.log("Setting EXPT Level 1!");
  await (await emtMarketplace.setExptLevel(1, 1000, 50)).wait();
  console.log("Done Setting EXPT Level 1!");
  console.log("Setting EXPT Level 2!");
  await (await emtMarketplace.setExptLevel(2, 3000, 100)).wait();
  console.log("Done Setting EXPT Level 2!");
  console.log("Setting EXPT Level 3!");
  await (await emtMarketplace.setExptLevel(3, 5000, 200)).wait();
  console.log("Done Setting EXPT Level 3!");
  // Set Acceptable Stable Coin
  console.log("Setting Acceptable Stable Coin!");
  await (await emtMarketplace.setAcceptableStablecoin(stableCoin.target, true)).wait();
  console.log("Done Setting Acceptable Stable Coin!");


  const chainId = (await ethers.provider.getNetwork()).chainId;
  if (chainId === 31337n) {
    //set lower expt level requirements for local testing
    console.log("resetting EXPT Level 1!");
    await (await emtMarketplace.setExptLevel(1, 10, 50)).wait();
    console.log("Done resetting EXPT Level 1!");
    console.log("resetting EXPT Level 2!");
    await (await emtMarketplace.setExptLevel(2, 20, 100)).wait();
    console.log("Done resetting EXPT Level 2!");
    console.log("resetting EXPT Level 3!");
    await (await emtMarketplace.setExptLevel(3, 30, 200)).wait();
    console.log("Done resetting EXPT Level 3!");

  }
  //Generate files containining Abis and contract addresses for use in frontend
  generateAbis(chainId, {
    EMTMarketplace: emtMarketplace.target,
    MentorToken: mentorToken.target,
    ExpertToken: expertToken.target,
  })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

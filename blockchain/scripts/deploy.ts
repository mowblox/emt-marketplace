import { ethers } from "hardhat";
import dotenv from "dotenv";

const generateAbis = require('./generateAbis');

dotenv.config();

async function main() {
  const [owner] = await ethers.getSigners();
  const defaultAdmin = process.env.TOKEN_DEFAULT_ADMIN || owner.address;

  // Deploy Marketplace Contract
  const emtMarketplace = await ethers.deployContract("EMTMarketplace", [defaultAdmin]);
  emtMarketplace.waitForDeployment();
  console.log("EMT Marketplace deployed at: ", emtMarketplace.target);

  const minter = process.env.TOKEN_MINTER || emtMarketplace.target;

  // Deploy Mentor Token
  const mentorToken = await ethers.deployContract("MentorToken", [
    defaultAdmin,
    minter
  ]);
  await mentorToken.waitForDeployment();
  console.log("Mentor Token deployed at: ", mentorToken.target);

  // Deploy Expert Token
  const expertToken = await ethers.deployContract("ExpertToken", [
    defaultAdmin,
    minter
  ]);
  await expertToken.waitForDeployment();
  console.log("Expert Token deployed at: ", expertToken.target);

  // Set Ment Token in Marketplace Contract
  console.log("Mentor Token Before: ", await emtMarketplace.mentTokenAddress());
  await emtMarketplace.setMentToken(mentorToken.target);
  console.log("Mentor Token After: ", await emtMarketplace.mentTokenAddress());

  const chainId = (await ethers.provider.getNetwork()).chainId;
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

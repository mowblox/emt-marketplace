import { ethers } from "hardhat";
import dotenv from "dotenv";

const generateAbis = require('./generateAbis.js');

dotenv.config();

async function main() {
  const [owner] = await ethers.getSigners();

  // Deploy Marketplace Contract
  const emtMarketplace = await ethers.deployContract("EMTMarketplace");
  emtMarketplace.waitForDeployment();
  // emtMarketplace.deploymentTransaction()?.chainId
  console.log("EMT Marketplace deployed at: ", emtMarketplace.target);

  const mentorToken = await ethers.deployContract("MentorToken", [
    process.env.TOKEN_DEFAULT_ADMIN || owner.address,
    process.env.TOKEN_MINTER || emtMarketplace.target,
  ]);
  await mentorToken.waitForDeployment();
  console.log("Mentor Token deployed at: ", mentorToken.target);
  
  const expertToken = await ethers.deployContract("ExpertToken", [
    process.env.TOKEN_DEFAULT_ADMIN || owner.address,
    process.env.TOKEN_MINTER || emtMarketplace.target,
  ]);
  await expertToken.waitForDeployment();
  console.log("Expert Token deployed at: ", expertToken.target);
  
  const networkname = (await ethers.provider.getNetwork())?.name
  //Generate files containining Abis and contract addresses for use in frontend
  generateAbis(networkname, {
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

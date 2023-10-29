import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const [_owner, defaultAdmin, minter] = await ethers.getSigners();

  const mentorToken = await ethers.deployContract("MentorToken", [
    process.env.MENTOR_TOKEN_DEFAULT_ADMIN || defaultAdmin.address,
    process.env.MENTOR_TOKEN_MINTER || minter.address,
  ]);

  await mentorToken.waitForDeployment();

  console.log("Mentor Token deployed at: ", mentorToken.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

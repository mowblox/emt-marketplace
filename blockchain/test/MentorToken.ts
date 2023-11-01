import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MentorToken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMentorTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, minter, user] = await ethers.getSigners();

    const MentorToken = await ethers.getContractFactory("MentorToken");
    const mentorToken = await MentorToken.deploy(owner.address, minter.address);

    return { mentorToken, owner, minter, user };
  }

  // Test Goes Below
  describe("Deployment", function () {
    it("deploys mentor token with all expected defaults", async function () {
      const { mentorToken } = await loadFixture(deployMentorTokenFixture);

      const TotalSupply = await mentorToken.totalSupply();
      const Name =  await mentorToken.name();
      const Symbol =  await mentorToken.symbol();
      const Decimals =  await mentorToken.decimals();
      expect([TotalSupply, Name, Symbol, Decimals]).to.deep.equal([0n, "Mentor Token", "MENT", 0n]);
    })
  });
  describe("Minting", function () {
    it("Should mint correctly", async function () {
      const { mentorToken, minter, user } = await loadFixture(deployMentorTokenFixture);

      const amountToMint = 1n;
      const initialBalance = await mentorToken.balanceOf(user.address);
      const initialTotalSupply = await mentorToken.totalSupply();
      
      await mentorToken.connect(minter).mint(user.address, amountToMint);
      
      const finalBalance = await mentorToken.balanceOf(user.address);
      const finalTotalSupply = await mentorToken.totalSupply();
      
      expect(finalBalance).to.equal(initialBalance + amountToMint);
      expect(finalTotalSupply).to.equal(initialTotalSupply + amountToMint);
    })

    it("Should not mint if not minter", async function () {
      const { mentorToken, user } = await loadFixture(deployMentorTokenFixture);
      const amountToMint = 1n;
      const initialBalance = await mentorToken.balanceOf(user.address);
      const initialTotalSupply = await mentorToken.totalSupply();
      
      await expect(mentorToken.connect(user).mint(user.address, 1)).to.be.revertedWithCustomError(mentorToken, 'AccessControlUnauthorizedAccount')
    })
  });
  describe("Minting", function () {
    it("Should mint correctly", async function () {
      const { mentorToken, minter, user } = await loadFixture(deployMentorTokenFixture);

      const amountToMint = 1n
      const initialBalance = await mentorToken.balanceOf(user.address);
      const initialTotalSupply = await mentorToken.totalSupply();
      await mentorToken.connect(minter).mint(user.address, amountToMint);
      const finalBalance = await mentorToken.balanceOf(user.address);
      const finalTotalSupply = await mentorToken.totalSupply();
      expect(finalBalance).to.equal(initialBalance + amountToMint);
      expect(finalTotalSupply).to.equal(initialTotalSupply + amountToMint);
    })
    it("Should not mint if not minter", async function () {
      const { mentorToken, user } = await loadFixture(deployMentorTokenFixture);

      const amountToMint = 1n
      const initialBalance = await mentorToken.balanceOf(user.address);
      const initialTotalSupply = await mentorToken.totalSupply();
      await expect(mentorToken.connect(user).mint(user.address, 1)).to.be.revertedWithCustomError(mentorToken, 'AccessControlUnauthorizedAccount')
      const finalBalance = await mentorToken.balanceOf(user.address);
      const finalTotalSupply = await mentorToken.totalSupply();
      expect(finalBalance).to.equal(initialBalance);
      expect(finalTotalSupply).to.equal(initialTotalSupply);
    })
  });
});

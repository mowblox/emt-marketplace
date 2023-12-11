import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("MentorToken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMentorTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, minter, user] = await ethers.getSigners();

    const MentorToken = await ethers.getContractFactory("MentorToken");
    const mentorToken = await upgrades.deployProxy(MentorToken, [owner.address, minter.address]);

    return { mentorToken, owner, minter, user };
  }

  // Test Goes Below
  describe("Deployment", function () {
    it("deploys mentor token with all expected defaults", async function () {
      const { mentorToken } = await loadFixture(deployMentorTokenFixture);

      const TotalSupply = await mentorToken.totalSupply();
      const Name = await mentorToken.name();
      const Symbol = await mentorToken.symbol();
      const Decimals = await mentorToken.decimals();
      expect([TotalSupply, Name, Symbol, Decimals]).to.deep.equal([0n, "Mentor Token", "MENT", 0n]);
    })
  });

  describe("Minting", function () {
    it("Should mint correctly", async function () {
      const { mentorToken, minter, user } = await loadFixture(deployMentorTokenFixture);

      const amount = 1n;
      const initialBalance = await mentorToken.balanceOf(user.address);
      const initialTotalSupply = await mentorToken.totalSupply();

      await mentorToken.connect(minter).mint(user.address, amount);

      const finalBalance = await mentorToken.balanceOf(user.address);
      const finalTotalSupply = await mentorToken.totalSupply();

      expect(finalBalance).to.equal(initialBalance + amount);
      expect(finalTotalSupply).to.equal(initialTotalSupply + amount);
    })

    it("Should not mint if not minter", async function () {
      const { mentorToken, user } = await loadFixture(deployMentorTokenFixture);

      const amount = 1n;
      await expect(mentorToken.connect(user).mint(user.address, amount)).to.be.revertedWithCustomError(mentorToken, 'AccessControlUnauthorizedAccount');
    })
  });

  describe("Burning", function () {
    it("Should burn correctly", async function () {
      const { mentorToken, minter, user } = await loadFixture(deployMentorTokenFixture);

      const amount = 1n
      await mentorToken.connect(minter).mint(user.address, amount);
      const initialBalance = await mentorToken.balanceOf(user.address);
      const initialTotalSupply = await mentorToken.totalSupply();
      await mentorToken.connect(minter).burnAsMinter(user.address, amount);
      const finalBalance = await mentorToken.balanceOf(user.address);
      const finalTotalSupply = await mentorToken.totalSupply();
      expect(finalBalance).to.equal(initialBalance - amount);
      expect(finalTotalSupply).to.equal(initialTotalSupply - amount);
    })

    it("Should not burn if not minter", async function () {
      const { mentorToken, minter, user } = await loadFixture(deployMentorTokenFixture);

      const amount = 1n
      await mentorToken.connect(minter).mint(user.address, amount);
      const initialBalance = await mentorToken.balanceOf(user.address);
      const initialTotalSupply = await mentorToken.totalSupply();
      await expect(mentorToken.connect(user).burnAsMinter(user.address, amount)).to.be.revertedWithCustomError(mentorToken, 'AccessControlUnauthorizedAccount');
      const finalBalance = await mentorToken.balanceOf(user.address);
      const finalTotalSupply = await mentorToken.totalSupply();
      expect(finalBalance).to.equal(initialBalance);
      expect(finalTotalSupply).to.equal(initialTotalSupply);
    })
  });

  describe("Transferring", function () {
    it("Should transfer if admin or minter", async function () {
      const { mentorToken, owner, minter, user } = await loadFixture(deployMentorTokenFixture);

      const amount = 1n
      await mentorToken.connect(minter).mint(owner.address, amount);
      await mentorToken.connect(minter).mint(minter.address, amount);
      await expect(mentorToken.connect(owner).transfer(user.address, amount)).to.be.emit(mentorToken, 'Transfer');
      await expect(mentorToken.connect(minter).transfer(user.address, amount)).to.be.emit(mentorToken, 'Transfer');
    })

    it("Should not transfer if not admin or minter", async function () {
      const { mentorToken, minter, user } = await loadFixture(deployMentorTokenFixture);

      const amount = 1n
      await mentorToken.connect(minter).mint(user.address, amount);
      await expect(mentorToken.connect(user).transfer(minter.address, amount)).to.be.revertedWith('MENT Token Not Tradable!');
    })
  });
});

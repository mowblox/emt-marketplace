import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ExpertToken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployExpertTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, minter, nonMinter] = await ethers.getSigners();

    const ExpertToken = await ethers.getContractFactory("ExpertToken");
    const expertToken = await ExpertToken.deploy(owner.address, minter.address);

    return { expertToken, owner, minter, nonMinter };
  }

  // Test Goes Below
  describe("Deployment and Configuration", function () {
    it("should deploy ExpertToken with the correct owner, minter, and URI_SETTER_ROLE", async function () {
      const { expertToken, owner, minter } = await loadFixture(deployExpertTokenFixture);
      expect(await expertToken.hasRole(await expertToken.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
      expect(await expertToken.hasRole(await expertToken.MINTER_ROLE(), minter.address)).to.equal(true);
      expect(await expertToken.hasRole(await expertToken.URI_SETTER_ROLE(), owner.address)).to.equal(true);
    });

    it("should set the initial URI", async function () {
      const { expertToken } = await loadFixture(deployExpertTokenFixture);
      expect(await expertToken.uri(0)).to.equal("https://firebasestorage.googleapis.com/v0/b/emt-marketplace/{id}.json");
    });
  });

  describe("setURI Function", function () {
    it("should allow the URI_SETTER_ROLE to set the URI", async function () {
      const { expertToken, owner } = await loadFixture(deployExpertTokenFixture);
      await expertToken.connect(owner).setURI("new-uri");
      expect(await expertToken.uri(0)).to.equal("new-uri");
    });

    it("should not allow an address without the URI_SETTER_ROLE to set the URI", async function () {
      const { expertToken, nonMinter } = await loadFixture(deployExpertTokenFixture);
      await expect(expertToken.connect(nonMinter).setURI("invalid-uri")).to.be.revertedWithCustomError(expertToken, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Minting Functions", function () {
    it("should allow the MINTER_ROLE to mint tokens", async function () {
      const { expertToken, owner, minter } = await loadFixture(deployExpertTokenFixture);
      await expertToken.connect(minter).mint(owner.address, 1, 10, "0x");
      expect(await expertToken.balanceOf(owner.address, 1)).to.equal(10);
    });

    it("should not allow an address without the MINTER_ROLE to mint tokens", async function () {
      const { expertToken, owner, nonMinter } = await loadFixture(deployExpertTokenFixture);
      await expect(expertToken.connect(nonMinter).mint(owner.address, 2, 5, "0x")).to.be.revertedWithCustomError(expertToken, "AccessControlUnauthorizedAccount")
    });

    it("should allow the MINTER_ROLE to mint tokens in batches", async function () {
      const { expertToken, owner, minter } = await loadFixture(deployExpertTokenFixture);
      await expertToken.connect(minter).mintBatch(owner.address, [3, 4], [5, 6], "0x");
      expect(await expertToken.balanceOf(owner.address, 3)).to.equal(5);
      expect(await expertToken.balanceOf(owner.address, 4)).to.equal(6);
    });

    it("should not allow an address without the MINTER_ROLE to mint tokens in batches", async function () {
      const { expertToken, owner, nonMinter } = await loadFixture(deployExpertTokenFixture);
      await expect(expertToken.connect(nonMinter).mintBatch(owner.address, [5, 6], [7, 8], "0x")).to.be.revertedWithCustomError(expertToken, "AccessControlUnauthorizedAccount")
    });
  });

  describe("supportsInterface Function", function () {
    it("should return true for supported interfaces", async function () {
      const { expertToken } = await loadFixture(deployExpertTokenFixture);
      const erc1155InterfaceId = "0xd9b67a26"; // ERC1155 interface ID
      expect(await expertToken.supportsInterface(erc1155InterfaceId)).to.equal(true);
    });
  });
});

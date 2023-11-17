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
    });
  });

  describe("Minting Test Cases", function () {
    it("should allow the MINTER_ROLE to mint tokens", async function () {
      const { expertToken, owner, minter } = await loadFixture(deployExpertTokenFixture);
      await expertToken.connect(minter).mint(owner.address, 10);
      expect(await expertToken.balanceOf(owner.address)).to.equal(10);
      expect(await expertToken.tokenURI(1)).to.be.equal("https://mowblox.com/1");
    });

    it("should not allow an address without the MINTER_ROLE to mint tokens", async function () {
      const { expertToken, owner, nonMinter } = await loadFixture(deployExpertTokenFixture);
      await expect(expertToken.connect(nonMinter).mint(owner.address, 10)).to.be.revertedWithCustomError(expertToken, "AccessControlUnauthorizedAccount")
    });
  });

  describe("Burning Test Cases", function () {
    it("should allow the MINTER_ROLE to burn tokens", async function () {
      const { expertToken, owner, minter } = await loadFixture(deployExpertTokenFixture);
      await expertToken.connect(minter).mint(owner.address, 10);
      await expertToken.connect(minter).burnAsMinter(1);

      expect(await expertToken.balanceOf(owner.address)).to.equal(9);
    });

    it("should not allow an address without the MINTER_ROLE to burn tokens", async function () {
      const { expertToken, owner, nonMinter } = await loadFixture(deployExpertTokenFixture);

      await expect(expertToken.connect(nonMinter).burnAsMinter(1)).to.be.revertedWithCustomError(expertToken, "AccessControlUnauthorizedAccount")
    });
  });

  describe("supportsInterface Function", function () {
    it("should return true for supported interfaces", async function () {
      const { expertToken } = await loadFixture(deployExpertTokenFixture);
      const erc721InterfaceId = "0x80ac58cd"; // ERC721 interface ID
      expect(await expertToken.supportsInterface(erc721InterfaceId)).to.equal(true);
    });

    it("should return false for unsupported interfaces", async function () {
      const { expertToken } = await loadFixture(deployExpertTokenFixture);
      const erc2981InterfaceId = "0x2a55205a"; // ERC2981 interface ID
      expect(await expertToken.supportsInterface(erc2981InterfaceId)).to.equal(false);
    });
  });
});

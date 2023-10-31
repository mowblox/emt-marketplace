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
        const [owner, minter] = await ethers.getSigners();

        const ExpertToken = await ethers.getContractFactory("ExpertToken");
        const expertToken = await ExpertToken.deploy(owner.address, minter.address);

        return { expertToken, owner, minter };
    }

    // Test Goes Below
    describe("Deployment", function () {
        it("deploys expert token with all expected defaults", async function () {
            const { expertToken } = await loadFixture(deployExpertTokenFixture);
        })
    });
});

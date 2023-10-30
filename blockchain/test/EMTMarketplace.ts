import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("EMTMarketplace", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployEMTMarketplaceFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, mentor, member] = await ethers.getSigners();

        const EMTMarketplace = await ethers.getContractFactory("EMTMarketplace");
        const emtMarketplace = await EMTMarketplace.deploy();

        const MentorToken = await ethers.getContractFactory("MentorToken");
        const mentorToken = await MentorToken.deploy(owner.address, emtMarketplace.target);

        // Mentor Approve MarketPlace Token
        await mentorToken.connect(mentor).approve(emtMarketplace.target, 1);

        return { emtMarketplace, mentorToken, owner, mentor, member };
    }

    // Test Goes Below
    describe("Deployment", function () {
        it("deploys mentor token with all expected defaults", async function () {
            const { emtMarketplace, mentorToken, mentor } = await loadFixture(deployEMTMarketplaceFixture);

            console.log("Market Place Allowance: ", await mentorToken.allowance(mentor.address, emtMarketplace.target));
        })
    });
});

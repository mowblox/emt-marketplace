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
        const [owner, minter] = await ethers.getSigners();

        const MentorToken = await ethers.getContractFactory("MentorToken");
        const mentorToken = await MentorToken.deploy(owner.address, minter.address);

        return { mentorToken, owner, minter };
    }

    // Test Goes Below
    describe("Deployment", function () {
        it("deploys mentor token with all expected defaults", async function () {
            const { mentorToken } = await loadFixture(deployMentorTokenFixture);

            console.log("Total Supply: ", await mentorToken.totalSupply());
            console.log("Name: ", await mentorToken.name());
            console.log("Symbol: ", await mentorToken.symbol());
            console.log("Decimals: ", await mentorToken.decimals());
        })
    });
});

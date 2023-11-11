import { loadFixture, mine } from "@nomicfoundation/hardhat-toolbox/network-helpers";
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
    const emtMarketplace = await EMTMarketplace.deploy(owner.address);

    const MentorToken = await ethers.getContractFactory("MentorToken");
    const mentorToken = await MentorToken.deploy(owner.address, emtMarketplace.target);

    return { emtMarketplace, mentorToken, owner, mentor, member };
  }

  // Test Goes Below
  describe("Deployment and Configuration", function () {
    it("should deploy EMTMarketplace with the correct owner", async function () {
      const { emtMarketplace, owner } = await loadFixture(deployEMTMarketplaceFixture);
      expect(await emtMarketplace.hasRole(await emtMarketplace.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    it("should set the MENT Token address", async function () {
      const { emtMarketplace, owner } = await loadFixture(deployEMTMarketplaceFixture);
      const randomAddress = "0x976EA74026E726554dB657fA54763abd0C3a0aa9";
      await emtMarketplace.connect(owner).setMentToken(randomAddress);
      expect(await emtMarketplace.mentTokenAddress()).to.equal(randomAddress);
    });

    it("should set the upvote weight", async function () {
      const { emtMarketplace, owner } = await loadFixture(deployEMTMarketplaceFixture);
      const newUpvoteWeight = 20;
      await emtMarketplace.connect(owner).setUpVoteWeight(newUpvoteWeight);
      expect(await emtMarketplace.upVoteWeight()).to.equal(newUpvoteWeight);
    });

    it("should set the downvote weight", async function () {
      const { emtMarketplace, owner } = await loadFixture(deployEMTMarketplaceFixture);
      const newDownvoteWeight = 7;
      await emtMarketplace.connect(owner).setDownVoteWeight(newDownvoteWeight);
      expect(await emtMarketplace.downVoteWeight()).to.equal(newDownvoteWeight);
    });
  });

  describe("Content Voting", function () {
    it("should allow a member to upvote content", async function () {
      const { emtMarketplace, mentor, member } = await loadFixture(deployEMTMarketplaceFixture);

      await emtMarketplace.connect(mentor).addContent(1);
      await emtMarketplace.connect(member).upVoteContent(1);
      expect((await emtMarketplace.connect(member).contentVotes(1))[2]).to.equal(1);
      const memberVotes = await emtMarketplace.connect(member).memberVotes(1, member.address);
      expect(memberVotes[0]).to.equal(true);
      expect(memberVotes[1]).to.equal(false);
    });

    it("should allow a member to upvote downvoted content", async function () {
      const { emtMarketplace, mentor, member } = await loadFixture(deployEMTMarketplaceFixture);

      await emtMarketplace.connect(mentor).addContent(1);
      await emtMarketplace.connect(member).downVoteContent(1);
      await emtMarketplace.connect(member).upVoteContent(1);
      expect((await emtMarketplace.connect(member).contentVotes(1))[2]).to.equal(1);
      const memberVotes = await emtMarketplace.connect(member).memberVotes(1, member.address);
      expect(memberVotes[0]).to.equal(true);
      expect(memberVotes[1]).to.equal(false);
    });

    it("should allow a member to downvote content", async function () {
      const { emtMarketplace, mentor, member } = await loadFixture(deployEMTMarketplaceFixture);

      await emtMarketplace.connect(mentor).addContent(1);
      await emtMarketplace.connect(member).downVoteContent(1);
      expect((await emtMarketplace.connect(member).contentVotes(1))[2]).to.equal(-1);
      const memberVotes = await emtMarketplace.connect(member).memberVotes(1, member.address);
      expect(memberVotes[0]).to.equal(false);
      expect(memberVotes[1]).to.equal(true);
    });

    it("should allow a member to downvote upvoted content", async function () {
      const { emtMarketplace, mentor, member } = await loadFixture(deployEMTMarketplaceFixture);

      await emtMarketplace.connect(mentor).addContent(1);
      await emtMarketplace.connect(member).upVoteContent(1);
      await emtMarketplace.connect(member).downVoteContent(1);
      expect((await emtMarketplace.connect(member).contentVotes(1))[2]).to.equal(-1);
      const memberVotes = await emtMarketplace.connect(member).memberVotes(1, member.address);
      expect(memberVotes[0]).to.equal(false);
      expect(memberVotes[1]).to.equal(true);
    });
  });

  describe("Ment Claiming", function () {
    it("should successfully claim ment", async function () {
      const { emtMarketplace, mentorToken, owner, mentor, member } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setMentToken(mentorToken.target);

      await emtMarketplace.connect(mentor).addContent(1);
      await emtMarketplace.connect(member).upVoteContent(1);

      await emtMarketplace.connect(owner).pause();
      await expect(emtMarketplace.connect(mentor).claimMent(1)).to.be.emit(emtMarketplace, "MentClaimed");
    });

    it("should not claim ment if ment token address is zero", async function () {
      const { emtMarketplace, owner, mentor } = await loadFixture(deployEMTMarketplaceFixture);

      await emtMarketplace.connect(owner).pause();
      await expect(emtMarketplace.connect(mentor).claimMent(1)).to.be.rejectedWith("Claiming is disabled!");
    });

    it("should not claim ment if claimable ment is zero", async function () {
      const { emtMarketplace, mentorToken, owner, mentor } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setMentToken(mentorToken.target);

      await emtMarketplace.connect(owner).pause();
      await expect(emtMarketplace.connect(mentor).claimMent(1)).to.be.rejectedWith("No MENT to claim!");
    });
  });

  describe("Additional Test Cases for require Statements", function () {
    it("should fail to set the MENT Token address if caller not admin", async function () {
      const { emtMarketplace, member } = await loadFixture(deployEMTMarketplaceFixture);
      const randomAddress = "0x976EA74026E726554dB657fA54763abd0C3a0aa9";
      await expect(emtMarketplace.connect(member).setMentToken(randomAddress)).to.be.revertedWithCustomError(emtMarketplace, "AccessControlUnauthorizedAccount");
    });

    it("should fail to set the upvote weight if caller not admin", async function () {
      const { emtMarketplace, member } = await loadFixture(deployEMTMarketplaceFixture);
      const newUpvoteWeight = 20;
      await expect(emtMarketplace.connect(member).setUpVoteWeight(newUpvoteWeight)).to.be.revertedWithCustomError(emtMarketplace, "AccessControlUnauthorizedAccount");
    });

    it("should fail to set the downvote weight if caller not admin", async function () {
      const { emtMarketplace, member } = await loadFixture(deployEMTMarketplaceFixture);
      const newDownvoteWeight = 7;
      await expect(emtMarketplace.connect(member).setDownVoteWeight(newDownvoteWeight)).to.be.revertedWithCustomError(emtMarketplace, "AccessControlUnauthorizedAccount");
    });

    it("should fail to upvote content with creator address set to address(0)", async function () {
      const { emtMarketplace, member } = await loadFixture(deployEMTMarketplaceFixture);

      await expect(emtMarketplace.connect(member).upVoteContent(1)).to.be.revertedWith("Voting not allowed for content without creator!");
    });

    it("should fail to downvote content with creator address set to address(0)", async function () {
      const { emtMarketplace, member } = await loadFixture(deployEMTMarketplaceFixture);

      await expect(emtMarketplace.connect(member).downVoteContent(1)).to.be.revertedWith("Voting not allowed for content without creator!");
    });

    it("should fail to upvote content when the member has already upvoted", async function () {
      const { emtMarketplace, member, mentor } = await loadFixture(deployEMTMarketplaceFixture);

      await emtMarketplace.connect(mentor).addContent(1);
      await emtMarketplace.connect(member).upVoteContent(1);
      await expect(emtMarketplace.connect(member).upVoteContent(1)).to.be.revertedWith("Member has already up voted!");
    });

    it("should fail to downvote content when the member has already downvoted", async function () {
      const { emtMarketplace, member, mentor } = await loadFixture(deployEMTMarketplaceFixture);

      await emtMarketplace.connect(mentor).addContent(1);
      await emtMarketplace.connect(member).downVoteContent(1);
      await expect(emtMarketplace.connect(member).downVoteContent(1)).to.be.revertedWith("Member has already down voted!");
    });

    it("should fail to upvote content when claim rules are not met", async function () {
      const { emtMarketplace, mentorToken, owner, member, mentor } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setMentToken(mentorToken.target);

      await emtMarketplace.connect(mentor).addContent(1);
      await emtMarketplace.connect(mentor).upVoteContent(1);
      await emtMarketplace.connect(member).upVoteContent(1);
      await emtMarketplace.connect(owner).upVoteContent(1);

      await emtMarketplace.connect(owner).pause();
      await emtMarketplace.connect(mentor).claimMent(1);
      await emtMarketplace.connect(owner).unpause();

      await expect(emtMarketplace.connect(member).upVoteContent(1)).to.be.revertedWith("Member has already up voted!");
    });

    it("should fail to downvote content when claim rules are not met", async function () {
      const { emtMarketplace, mentorToken, owner, member, mentor } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setMentToken(mentorToken.target);

      await emtMarketplace.connect(mentor).addContent(1);
      await emtMarketplace.connect(member).downVoteContent(1);
      await emtMarketplace.connect(owner).upVoteContent(1);
      await emtMarketplace.connect(mentor).upVoteContent(1);

      await emtMarketplace.connect(owner).pause();
      await emtMarketplace.connect(mentor).claimMent(1);
      await emtMarketplace.connect(owner).unpause();

      await expect(emtMarketplace.connect(member).downVoteContent(1)).to.be.revertedWith("Member has already down voted!");
    });
  });
});

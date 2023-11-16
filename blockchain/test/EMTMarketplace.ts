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
    const contentId = ethers.encodeBytes32String("LoOb7y8KHesW98X6MVJ5");

    const EMTMarketplace = await ethers.getContractFactory("EMTMarketplace");
    const emtMarketplace = await EMTMarketplace.deploy(owner.address);

    const MentorToken = await ethers.getContractFactory("MentorToken");
    const mentorToken = await MentorToken.deploy(owner.address, emtMarketplace.target);

    return { emtMarketplace, mentorToken, owner, mentor, member, contentId };
  }

  // Test Goes Below
  describe("Deployment and Configuration", function () {
    it("should deploy EMTMarketplace with the correct owner", async function () {
      const { emtMarketplace, owner } = await loadFixture(deployEMTMarketplaceFixture);
      expect(await emtMarketplace.hasRole(await emtMarketplace.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    it("should deploy EMTMarketplace with the correct pauser", async function () {
      const { emtMarketplace, owner } = await loadFixture(deployEMTMarketplaceFixture);
      expect(await emtMarketplace.hasRole(await emtMarketplace.PAUSER_ROLE(), owner.address)).to.equal(true);
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

  describe("Adding Content", function () {
    it("should allow member to add content", async function () {
      const { emtMarketplace, mentor, contentId } = await loadFixture(deployEMTMarketplaceFixture);

      await expect(emtMarketplace.connect(mentor).addContent(contentId)).to.be.emit(emtMarketplace, "ContentAdded");
    });

    it("should not allow member to add same content id again", async function () {
      const { emtMarketplace, mentor, contentId } = await loadFixture(deployEMTMarketplaceFixture);

      await expect(emtMarketplace.connect(mentor).addContent(contentId)).to.be.emit(emtMarketplace, "ContentAdded");
      await expect(emtMarketplace.connect(mentor).addContent(contentId)).to.be.revertedWith("Creator already exists!");
    });
  });

  describe("Content Voting", function () {
    it("should allow a member to upvote content", async function () {
      const { emtMarketplace, mentor, member, contentId } = await loadFixture(deployEMTMarketplaceFixture);

      await emtMarketplace.connect(mentor).addContent(contentId);
      await emtMarketplace.connect(member).upVoteContent(contentId);
      expect((await emtMarketplace.connect(member).contentVotes(contentId))[2]).to.equal(1);
      const memberVotes = await emtMarketplace.connect(member).memberVotes(contentId, member.address);
      expect(memberVotes[0]).to.equal(true);
      expect(memberVotes[1]).to.equal(false);
    });

    it("should allow a member to upvote downvoted content", async function () {
      const { emtMarketplace, mentor, member, contentId } = await loadFixture(deployEMTMarketplaceFixture);

      await emtMarketplace.connect(mentor).addContent(contentId);
      await emtMarketplace.connect(member).downVoteContent(contentId);
      await emtMarketplace.connect(member).upVoteContent(contentId);
      expect((await emtMarketplace.connect(member).contentVotes(contentId))[2]).to.equal(1);
      const memberVotes = await emtMarketplace.connect(member).memberVotes(contentId, member.address);
      expect(memberVotes[0]).to.equal(true);
      expect(memberVotes[1]).to.equal(false);
    });

    it("should fail to upvote content with creator address set to address(0)", async function () {
      const { emtMarketplace, member, contentId } = await loadFixture(deployEMTMarketplaceFixture);

      await expect(emtMarketplace.connect(member).upVoteContent(contentId)).to.be.revertedWith("Voting not allowed for content without creator!");
    });

    it("should fail to upvote content when the member has already upvoted", async function () {
      const { emtMarketplace, member, mentor, contentId } = await loadFixture(deployEMTMarketplaceFixture);

      await emtMarketplace.connect(mentor).addContent(contentId);
      await emtMarketplace.connect(member).upVoteContent(contentId);
      await expect(emtMarketplace.connect(member).upVoteContent(contentId)).to.be.revertedWith("Member has already up voted!");
    });

    it("should fail to upvote content when claim rules are not met", async function () {
      const { emtMarketplace, mentorToken, owner, member, mentor, contentId } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setMentToken(mentorToken.target);
      await emtMarketplace.connect(mentor).addContent(contentId);

      await emtMarketplace.connect(member).downVoteContent(contentId);
      await emtMarketplace.connect(mentor).upVoteContent(contentId);
      await emtMarketplace.connect(owner).upVoteContent(contentId);

      await emtMarketplace.connect(owner).pause();
      await emtMarketplace.connect(mentor).claimMent();
      await emtMarketplace.connect(owner).unpause();

      await expect(emtMarketplace.connect(member).upVoteContent(contentId)).to.be.revertedWith("Cannot Vote Again Due to Claim Rules!");
    });

    it("should fail to upvote content if contract is paused", async function () {
      const { emtMarketplace, owner, mentor, member, contentId } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).pause();

      await emtMarketplace.connect(mentor).addContent(contentId);
      await expect(emtMarketplace.connect(member).upVoteContent(contentId)).to.be.revertedWithCustomError(emtMarketplace, "EnforcedPause");
    });

    it("should allow a member to downvote content", async function () {
      const { emtMarketplace, mentor, member, contentId } = await loadFixture(deployEMTMarketplaceFixture);

      await emtMarketplace.connect(mentor).addContent(contentId);
      await emtMarketplace.connect(member).downVoteContent(contentId);
      expect((await emtMarketplace.connect(member).contentVotes(contentId))[2]).to.equal(-1);
      const memberVotes = await emtMarketplace.connect(member).memberVotes(contentId, member.address);
      expect(memberVotes[0]).to.equal(false);
      expect(memberVotes[1]).to.equal(true);
    });

    it("should allow a member to downvote upvoted content", async function () {
      const { emtMarketplace, mentor, member, contentId } = await loadFixture(deployEMTMarketplaceFixture);

      await emtMarketplace.connect(mentor).addContent(contentId);
      await emtMarketplace.connect(member).upVoteContent(contentId);
      await emtMarketplace.connect(member).downVoteContent(contentId);
      expect((await emtMarketplace.connect(member).contentVotes(contentId))[2]).to.equal(-1);
      const memberVotes = await emtMarketplace.connect(member).memberVotes(contentId, member.address);
      expect(memberVotes[0]).to.equal(false);
      expect(memberVotes[1]).to.equal(true);
    });

    it("should fail to downvote content with creator address set to address(0)", async function () {
      const { emtMarketplace, member, contentId } = await loadFixture(deployEMTMarketplaceFixture);

      await expect(emtMarketplace.connect(member).downVoteContent(contentId)).to.be.revertedWith("Voting not allowed for content without creator!");
    });

    it("should fail to downvote content when the member has already downvoted", async function () {
      const { emtMarketplace, member, mentor, contentId } = await loadFixture(deployEMTMarketplaceFixture);

      await emtMarketplace.connect(mentor).addContent(contentId);
      await emtMarketplace.connect(member).downVoteContent(contentId);
      await expect(emtMarketplace.connect(member).downVoteContent(contentId)).to.be.revertedWith("Member has already down voted!");
    });

    it("should fail to downvote content when claim rules are not met", async function () {
      const { emtMarketplace, mentorToken, owner, member, mentor, contentId } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setMentToken(mentorToken.target);
      await emtMarketplace.connect(mentor).addContent(contentId);

      await emtMarketplace.connect(member).upVoteContent(contentId);
      await emtMarketplace.connect(mentor).upVoteContent(contentId);
      await emtMarketplace.connect(owner).upVoteContent(contentId);

      await emtMarketplace.connect(owner).pause();
      await emtMarketplace.connect(mentor).claimMent();
      await emtMarketplace.connect(owner).unpause();

      await expect(emtMarketplace.connect(member).downVoteContent(contentId)).to.be.revertedWith("Cannot Vote Again Due to Claim Rules!");
    });

    it("should fail to downvote content if contract is paused", async function () {
      const { emtMarketplace, owner, mentor, member, contentId } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).pause();

      await emtMarketplace.connect(mentor).addContent(contentId);
      await expect(emtMarketplace.connect(member).downVoteContent(contentId)).to.be.revertedWithCustomError(emtMarketplace, "EnforcedPause");
    });
  });

  describe("Ment Claiming", function () {
    it("should successfully claim ment", async function () {
      const { emtMarketplace, mentorToken, owner, mentor, member, contentId } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setMentToken(mentorToken.target);

      await emtMarketplace.connect(mentor).addContent(contentId);
      await emtMarketplace.connect(member).upVoteContent(contentId);

      await emtMarketplace.connect(owner).pause();
      await expect(emtMarketplace.connect(mentor).claimMent()).to.be.emit(emtMarketplace, "MentClaimed");
    });

    it("should not claim ment if ment token address is zero", async function () {
      const { emtMarketplace, owner, mentor } = await loadFixture(deployEMTMarketplaceFixture);

      await emtMarketplace.connect(owner).pause();
      await expect(emtMarketplace.connect(mentor).claimMent()).to.be.revertedWith("Claiming is disabled!");
    });

    it("should not claim ment if claimable ment is zero", async function () {
      const { emtMarketplace, mentorToken, owner, mentor } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setMentToken(mentorToken.target);

      await emtMarketplace.connect(owner).pause();
      await expect(emtMarketplace.connect(mentor).claimMent()).to.be.revertedWith("No MENT to claim!");
    });

    it("should not claim ment if contract is not paused", async function () {
      const { emtMarketplace, mentor } = await loadFixture(deployEMTMarketplaceFixture);

      await expect(emtMarketplace.connect(mentor).claimMent()).to.be.revertedWithCustomError(emtMarketplace, "ExpectedPause");
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

    it("should fail to pause contract if caller has no pauser role", async function () {
      const { emtMarketplace, member } = await loadFixture(deployEMTMarketplaceFixture);

      await expect(emtMarketplace.connect(member).pause()).to.be.revertedWithCustomError(emtMarketplace, "AccessControlUnauthorizedAccount");
    });

    it("should fail to unpause contract if caller has no pauser role", async function () {
      const { emtMarketplace, member } = await loadFixture(deployEMTMarketplaceFixture);

      await expect(emtMarketplace.connect(member).unpause()).to.be.revertedWithCustomError(emtMarketplace, "AccessControlUnauthorizedAccount");
    });
  });
});

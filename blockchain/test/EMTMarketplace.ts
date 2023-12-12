import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("EMTMarketplace", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployEMTMarketplaceFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, mentor, member] = await ethers.getSigners();
    const contentId = ethers.encodeBytes32String("LoOb7y8KHesW98X6MVJ5");

    const StableCoin = await ethers.getContractFactory("StableCoin");
    const stableCoin = await upgrades.deployProxy(StableCoin, ["StableCoin", "SBC", owner.address]);
    await stableCoin.mint(member.address, ethers.parseUnits("1000000", await stableCoin.decimals()));

    const EMTMarketplace = await ethers.getContractFactory("EMTMarketplace");
    const emtMarketplace = await upgrades.deployProxy(EMTMarketplace, [owner.address]);
    await emtMarketplace.setExptLevel(1, 1000, 50);
    await emtMarketplace.setExptLevel(2, 3000, 100);
    await emtMarketplace.setExptLevel(3, 5000, 200);
    await emtMarketplace.setAcceptableStablecoin(stableCoin.target, true);

    const MentorToken = await ethers.getContractFactory("MentorToken");
    const mentorToken = await upgrades.deployProxy(MentorToken, [owner.address, emtMarketplace.target]);

    const ExpertToken = await ethers.getContractFactory("ExpertToken");
    const expertToken = await upgrades.deployProxy(ExpertToken, [owner.address, emtMarketplace.target]);

    return { emtMarketplace, mentorToken, expertToken, stableCoin, owner, mentor, member, contentId };
  }

  // Test Goes Below
  describe("Deployment and Configuration", function () {
    it("should deploy EMTMarketplace with the correct owner", async function () {
      const { emtMarketplace, owner } = await loadFixture(deployEMTMarketplaceFixture);
      expect(await emtMarketplace.hasRole(await emtMarketplace.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    // it("should deploy EMTMarketplace with the correct pauser", async function () {
    //   const { emtMarketplace, owner } = await loadFixture(deployEMTMarketplaceFixture);
    //   expect(await emtMarketplace.hasRole(await emtMarketplace.PAUSER_ROLE(), owner.address)).to.equal(true);
    // });

    it("should set the token addresses", async function () {
      const { emtMarketplace, mentorToken, expertToken, owner } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setTokenAddresses(mentorToken.target, expertToken.target);
      expect(await emtMarketplace.mentTokenAddress()).to.equal(mentorToken.target);
      expect(await emtMarketplace.exptTokenAddress()).to.equal(expertToken.target);
    });

    it("should set the upvote weight", async function () {
      const { emtMarketplace, owner } = await loadFixture(deployEMTMarketplaceFixture);
      const newUpvoteMultiplier = 20;
      await emtMarketplace.connect(owner).setUpVoteMultiplier(newUpvoteMultiplier);
      expect(await emtMarketplace.upVoteMultiplier()).to.equal(newUpvoteMultiplier);
    });

    it("should set the downvote weight", async function () {
      const { emtMarketplace, owner } = await loadFixture(deployEMTMarketplaceFixture);
      const newDownvoteMultiplier = 7;
      await emtMarketplace.connect(owner).setDownVoteMultiplier(newDownvoteMultiplier);
      expect(await emtMarketplace.downVoteMultiplier()).to.equal(newDownvoteMultiplier);
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
      const creatorVotes = await emtMarketplace.creatorVotes(mentor.address)
      expect(creatorVotes[0]).to.equal(1);
      expect(creatorVotes[1]).to.equal(0);
      expect(creatorVotes[2]).to.equal(1);
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
      const creatorVotes = await emtMarketplace.creatorVotes(mentor.address)
      expect(creatorVotes[0]).to.equal(1);
      expect(creatorVotes[1]).to.equal(0);
      expect(creatorVotes[2]).to.equal(1);
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
      const { emtMarketplace, mentorToken, expertToken, owner, member, mentor, contentId } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setTokenAddresses(mentorToken.target, expertToken.target);
      await emtMarketplace.connect(mentor).addContent(contentId);

      await emtMarketplace.connect(member).downVoteContent(contentId);
      await emtMarketplace.connect(mentor).upVoteContent(contentId);
      await emtMarketplace.connect(owner).upVoteContent(contentId);

      await emtMarketplace.connect(mentor).claimMent();

      await expect(emtMarketplace.connect(member).upVoteContent(contentId)).to.be.revertedWith("Cannot Vote Again Due to Claim Rules!");
    });

    // it("should fail to upvote content if contract is paused", async function () {
    //   const { emtMarketplace, owner, mentor, member, contentId } = await loadFixture(deployEMTMarketplaceFixture);
    //   await emtMarketplace.connect(owner).pause();

    //   await emtMarketplace.connect(mentor).addContent(contentId);
    //   await expect(emtMarketplace.connect(member).upVoteContent(contentId)).to.be.revertedWithCustomError(emtMarketplace, "EnforcedPause");
    // });

    it("should allow a member to downvote content", async function () {
      const { emtMarketplace, mentor, member, contentId } = await loadFixture(deployEMTMarketplaceFixture);

      await emtMarketplace.connect(mentor).addContent(contentId);
      await emtMarketplace.connect(member).downVoteContent(contentId);
      expect((await emtMarketplace.connect(member).contentVotes(contentId))[2]).to.equal(-1);
      const memberVotes = await emtMarketplace.connect(member).memberVotes(contentId, member.address);
      expect(memberVotes[0]).to.equal(false);
      expect(memberVotes[1]).to.equal(true);
      const creatorVotes = await emtMarketplace.creatorVotes(mentor.address)
      expect(creatorVotes[0]).to.equal(0);
      expect(creatorVotes[1]).to.equal(1);
      expect(creatorVotes[2]).to.equal(-1);
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
      const creatorVotes = await emtMarketplace.creatorVotes(mentor.address)
      expect(creatorVotes[0]).to.equal(0);
      expect(creatorVotes[1]).to.equal(1);
      expect(creatorVotes[2]).to.equal(-1);
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
      const { emtMarketplace, mentorToken, expertToken, owner, member, mentor, contentId } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setTokenAddresses(mentorToken.target, expertToken.target);
      await emtMarketplace.connect(mentor).addContent(contentId);

      await emtMarketplace.connect(member).upVoteContent(contentId);
      await emtMarketplace.connect(mentor).upVoteContent(contentId);
      await emtMarketplace.connect(owner).upVoteContent(contentId);

      await emtMarketplace.connect(mentor).claimMent();

      await expect(emtMarketplace.connect(member).downVoteContent(contentId)).to.be.revertedWith("Cannot Vote Again Due to Claim Rules!");
    });

    // it("should fail to downvote content if contract is paused", async function () {
    //   const { emtMarketplace, owner, mentor, member, contentId } = await loadFixture(deployEMTMarketplaceFixture);
    //   await emtMarketplace.connect(owner).pause();

    //   await emtMarketplace.connect(mentor).addContent(contentId);
    //   await expect(emtMarketplace.connect(member).downVoteContent(contentId)).to.be.revertedWithCustomError(emtMarketplace, "EnforcedPause");
    // });
  });

  describe("Ment Claiming", function () {
    it("should successfully claim ment", async function () {
      const { emtMarketplace, mentorToken, expertToken, owner, mentor, member, contentId } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setTokenAddresses(mentorToken.target, expertToken.target);

      await emtMarketplace.connect(mentor).addContent(contentId);
      await emtMarketplace.connect(member).upVoteContent(contentId);
      expect(await emtMarketplace.unclaimedMent(mentor.address)).to.be.equal(10);

      await expect(emtMarketplace.connect(mentor).claimMent()).to.be.emit(emtMarketplace, "MentClaimed");
      expect(await emtMarketplace.unclaimedMent(mentor.address)).to.be.equal(0);
    });

    it("should not claim ment if ment token address is zero", async function () {
      const { emtMarketplace, owner, mentor } = await loadFixture(deployEMTMarketplaceFixture);

      await expect(emtMarketplace.connect(mentor).claimMent()).to.be.revertedWith("MENT claiming is disabled!");
    });

    it("should not claim ment if claimable ment is zero", async function () {
      const { emtMarketplace, mentorToken, expertToken, owner, mentor } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setTokenAddresses(mentorToken.target, expertToken.target);

      await expect(emtMarketplace.connect(mentor).claimMent()).to.be.revertedWith("No MENT to claim!");
    });

    // it("should not claim ment if contract is not paused", async function () {
    //   const { emtMarketplace, mentor } = await loadFixture(deployEMTMarketplaceFixture);

    //   await expect(emtMarketplace.connect(mentor).claimMent()).to.be.revertedWithCustomError(emtMarketplace, "ExpectedPause");
    // });
  });

  describe("Expt Claiming", function () {
    it("should successfully claim expt levels", async function () {
      const { emtMarketplace, mentorToken, expertToken, owner, mentor } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setTokenAddresses(mentorToken.target, expertToken.target);

      await mentorToken.connect(owner).grantRole(await mentorToken.MINTER_ROLE(), owner.address);
      await mentorToken.connect(owner).mint(mentor.address, 1100);
      expect(await emtMarketplace.unclaimedExpt(mentor.address, 1)).to.be.equal(50);
      await expect(emtMarketplace.connect(mentor).claimExpt(1)).to.be.emit(emtMarketplace, "ExptClaimed");
      await mentorToken.connect(owner).mint(mentor.address, 2100);
      expect(await emtMarketplace.unclaimedExpt(mentor.address, 2)).to.be.equal(50);
      await expect(emtMarketplace.connect(mentor).claimExpt(2)).to.be.emit(emtMarketplace, "ExptClaimed");
      await mentorToken.connect(owner).mint(mentor.address, 2500);
      expect(await emtMarketplace.unclaimedExpt(mentor.address, 3)).to.be.equal(100);
      await expect(emtMarketplace.connect(mentor).claimExpt(3)).to.be.emit(emtMarketplace, "ExptClaimed");
    });

    it("should not claim expt if expt token address is zero", async function () {
      const { emtMarketplace, mentorToken, owner, mentor } = await loadFixture(deployEMTMarketplaceFixture);

      await mentorToken.connect(owner).grantRole(await mentorToken.MINTER_ROLE(), owner.address);
      await mentorToken.connect(owner).mint(mentor.address, 1034);
      await expect(emtMarketplace.connect(mentor).claimExpt(1)).to.be.revertedWith("EXPT claiming is disabled!");
    });

    it("should not claim expt if not qualified for level", async function () {
      const { emtMarketplace, mentorToken, expertToken, owner, mentor } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setTokenAddresses(mentorToken.target, expertToken.target);

      await mentorToken.connect(owner).grantRole(await mentorToken.MINTER_ROLE(), owner.address);
      await mentorToken.connect(owner).mint(mentor.address, 1204);
      await expect(emtMarketplace.connect(mentor).claimExpt(2)).to.be.revertedWith("Not qualified for level!");
    });

    it("should not be able to over claim expt level more than once", async function () {
      const { emtMarketplace, mentorToken, expertToken, owner, mentor } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setTokenAddresses(mentorToken.target, expertToken.target);

      await mentorToken.connect(owner).grantRole(await mentorToken.MINTER_ROLE(), owner.address);
      await mentorToken.connect(owner).mint(mentor.address, 1015);
      await emtMarketplace.connect(mentor).claimExpt(1);
      await expect(emtMarketplace.connect(mentor).claimExpt(1)).to.be.revertedWith("Level has already been claimed!");
    });
  });

  describe("EXPT Offering, Buying & Withdrawal", function () {
    it("mentor should be able to offer EXPT on marketplace", async function () {
      const { emtMarketplace, expertToken, mentorToken, stableCoin, owner, mentor } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setTokenAddresses(mentorToken.target, expertToken.target);

      await expertToken.connect(owner).grantRole(await expertToken.MINTER_ROLE(), owner.address);
      await expertToken.connect(owner).mint(mentor.address, 10);
      await expertToken.connect(mentor).setApprovalForAll(emtMarketplace.target, true);
      const tokenIds = Object.values(await expertToken.tokensOfOwner(mentor.address));
      await expect(emtMarketplace.connect(mentor).offerExpts(
        tokenIds,
        stableCoin.target,
        ethers.parseUnits("10", await stableCoin.decimals())
      )).to.be.emit(emtMarketplace, "ExptDeposited");
    });

    it("member should be able to buy EXPT from marketplace", async function () {
      const { emtMarketplace, mentorToken, expertToken, stableCoin, owner, mentor, member } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setTokenAddresses(mentorToken.target, expertToken.target);

      // Deposit
      await expertToken.connect(owner).grantRole(await expertToken.MINTER_ROLE(), owner.address);
      await expertToken.connect(owner).mint(mentor.address, 10);
      await expertToken.connect(mentor).setApprovalForAll(emtMarketplace.target, true);
      const tokenIds = Object.values(await expertToken.tokensOfOwner(mentor.address));
      await expect(emtMarketplace.connect(mentor).offerExpts(
        tokenIds,
        stableCoin.target,
        ethers.parseUnits("10", await stableCoin.decimals())
      )).to.be.emit(emtMarketplace, "ExptDeposited");

      // Buy
      // console.log(await Promise.all((await expertToken.tokensOfOwner(emtMarketplace.target)).map(tokenId => emtMarketplace.exptOffers(tokenId))));
      const exptOffer = await emtMarketplace.exptOffers(0);
      await stableCoin.connect(member).approve(emtMarketplace.target, exptOffer.amount);
      await expect(emtMarketplace.connect(member).buyExpt(0)).to.be.emit(emtMarketplace, "ExptBought");
    });

    it("mentor should be able to withdraw EXPT from marketplace", async function () {
      const { emtMarketplace, mentorToken, expertToken, stableCoin, owner, mentor } = await loadFixture(deployEMTMarketplaceFixture);
      await emtMarketplace.connect(owner).setTokenAddresses(mentorToken.target, expertToken.target);

      // Deposit
      await expertToken.connect(owner).grantRole(await expertToken.MINTER_ROLE(), owner.address);
      await expertToken.connect(owner).mint(mentor.address, 10);
      await expertToken.connect(mentor).setApprovalForAll(emtMarketplace.target, true);
      const tokenIds = Object.values(await expertToken.tokensOfOwner(mentor.address));
      await expect(emtMarketplace.connect(mentor).offerExpts(
        tokenIds,
        stableCoin.target,
        ethers.parseUnits("10", await stableCoin.decimals())
      )).to.be.emit(emtMarketplace, "ExptDeposited");

      // Withdrawal
      await expect(emtMarketplace.connect(mentor).withdrawExpt(0)).to.be.emit(emtMarketplace, "ExptWithdrawn");
    });
  });

  describe("Additional Test Cases for require Statements", function () {
    it("should fail to set the token addresses if caller not admin", async function () {
      const { emtMarketplace, mentorToken, expertToken, member } = await loadFixture(deployEMTMarketplaceFixture);
      await expect(emtMarketplace.connect(member).setTokenAddresses(mentorToken.target, expertToken.target)).to.be.revertedWithCustomError(emtMarketplace, "AccessControlUnauthorizedAccount");
    });

    it("should fail to set the upvote weight if caller not admin", async function () {
      const { emtMarketplace, member } = await loadFixture(deployEMTMarketplaceFixture);
      const newUpvoteMultiplier = 20;
      await expect(emtMarketplace.connect(member).setUpVoteMultiplier(newUpvoteMultiplier)).to.be.revertedWithCustomError(emtMarketplace, "AccessControlUnauthorizedAccount");
    });

    it("should fail to set the downvote weight if caller not admin", async function () {
      const { emtMarketplace, member } = await loadFixture(deployEMTMarketplaceFixture);
      const newDownvoteMultiplier = 7;
      await expect(emtMarketplace.connect(member).setDownVoteMultiplier(newDownvoteMultiplier)).to.be.revertedWithCustomError(emtMarketplace, "AccessControlUnauthorizedAccount");
    });

    // it("should fail to pause contract if caller has no pauser role", async function () {
    //   const { emtMarketplace, member } = await loadFixture(deployEMTMarketplaceFixture);

    //   await expect(emtMarketplace.connect(member).pause()).to.be.revertedWithCustomError(emtMarketplace, "AccessControlUnauthorizedAccount");
    // });

    // it("should fail to unpause contract if caller has no pauser role", async function () {
    //   const { emtMarketplace, member } = await loadFixture(deployEMTMarketplaceFixture);

    //   await expect(emtMarketplace.connect(member).unpause()).to.be.revertedWithCustomError(emtMarketplace, "AccessControlUnauthorizedAccount");
    // });
  });
});

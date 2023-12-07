// SPDX-License-Identifier: APACHE
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./MentorToken.sol";
import "./ExpertToken.sol";

/// @custom:security-contact odafe@mowblox.com
contract EMTMarketplace is Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    struct MemberVote {
        bool upVoted;
        bool downVoted;
        uint256 lastVotedAt;
    }
    struct CreatorVote {
        uint256 upVotes;
        uint256 downVotes;
        uint256 lastClaimedUpVotes;
        uint256 lastClaimedDownVotes;
        uint256 lastClaimedAt;
    }
    struct ContentVote {
        address creator;
        uint256 upVotes;
        uint256 downVotes;
        mapping(address => MemberVote) memberVotes;
    }
    struct ExptOffer {
        address owner;
        uint256 tokenId;
        address stablecoin;
        uint256 amount;
    }
    struct ExptLevel {
        uint256 requiredMent;
        uint256 receivableExpt;
    }

    // Event Definitions
    event ContentAdded(address indexed, bytes32);
    event ContentUpVoted(bytes32 indexed, uint256);
    event ContentDownVoted(bytes32 indexed, uint256);
    event MentClaimed(address indexed, uint256);
    event ExptClaimed(address indexed, uint256);
    event ExptDeposited(address indexed, uint256);
    event ExptBought(address indexed, uint256);
    event ExptWithdrawn(address indexed, uint256);

    // Public Data Definitions
    address public mentTokenAddress;
    address public exptTokenAddress;
    uint256 public upVoteMultiplier = 10;
    uint256 public downVoteMultiplier = 5;
    uint256 public exptTokenDivisor = 20;
    uint256 public exptBuyFeePercent = 2;
    mapping(uint256 => ExptOffer) public exptOffers;
    mapping(uint256 => ExptLevel) public exptLevels;
    // Private Data Definitions
    mapping(bytes32 => ContentVote) _contentVotes;
    mapping(address => CreatorVote) _creatorVotes;
    mapping(address => uint256) _creatorTickets;

    /**
     * @dev Grants defaultAdmin & pauser roles.
     */
    constructor(address defaultAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, defaultAdmin);
    }

    /**
     * @dev Pauses marketplace to allow for MENT claiming.
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses marketplace to allow voting.
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Sets MENT & EXPT token addresses.
     */
    function setTokenAddresses(
        address _mentTokenAddress,
        address _exptTokenAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        mentTokenAddress = _mentTokenAddress;
        exptTokenAddress = _exptTokenAddress;
    }

    /**
     * @dev Sets the up vote weight.
     */
    function setUpVoteMultiplier(
        uint256 _upVoteMultiplier
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        upVoteMultiplier = _upVoteMultiplier;
    }

    /**
     * @dev Sets the down vote weight.
     */
    function setDownVoteMultiplier(
        uint256 _downVoteMultiplier
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        downVoteMultiplier = _downVoteMultiplier;
    }

    /**
     * @dev Sets expt level.
     */
    function setExptLevel(
        uint256 _level,
        uint256 _requiredMent,
        uint256 _receivableExpt
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Retrieve Expt Level
        ExptLevel storage _exptLevel = exptLevels[_level];
        // Update fields
        _exptLevel.requiredMent = _requiredMent;
        _exptLevel.receivableExpt = _receivableExpt;
    }

    /**
     * @dev Returns creator's upvotes, downvotes & difference.
     */
    function creatorVotes(
        address _creator
    ) external view returns (uint256, uint256, int256) {
        return (
            _creatorVotes[_creator].upVotes,
            _creatorVotes[_creator].downVotes,
            int256(_creatorVotes[_creator].upVotes) -
                int256(_creatorVotes[_creator].downVotes)
        );
    }

    /**
     * @dev Returns content's upvotes, downvotes & difference.
     */
    function contentVotes(
        bytes32 _id
    ) public view returns (uint256, uint256, int256) {
        return (
            _contentVotes[_id].upVotes,
            _contentVotes[_id].downVotes,
            int256(_contentVotes[_id].upVotes) -
                int256(_contentVotes[_id].downVotes)
        );
    }

    /**
     * @dev Returns member upvoted or downvoted status for a particular content id.
     */
    function memberVotes(
        bytes32 _id,
        address _member
    ) public view returns (bool, bool) {
        return (
            _contentVotes[_id].memberVotes[_member].upVoted,
            _contentVotes[_id].memberVotes[_member].downVoted
        );
    }

    /**
     * @dev Returns unclaimed MENT for a creator.
     */
    function unclaimedMent(address _creator) external view returns (int256) {
        // Retrieve Creator Vote
        CreatorVote storage _creatorVote = _creatorVotes[_creator];
        // Compute unclaimed MENT
        return
            ((int256(_creatorVote.upVotes) -
                int256(_creatorVote.lastClaimedUpVotes)) *
                int256(upVoteMultiplier)) -
            ((int256(_creatorVote.downVotes) -
                int256(_creatorVote.lastClaimedDownVotes)) *
                int256(downVoteMultiplier));
    }

    /**
     * @dev Returns unclaimed EXPT for a creator.
     */
    function unclaimedExpt(
        address _creator,
        uint256 _level
    ) external view returns (uint256) {
        // Retrieve Expt Level
        ExptLevel storage _exptLevel = exptLevels[_level];
        // Check if expt level exists
        require(_exptLevel.requiredMent > 0, "Expt Level does not exists!");
        // Get _creator MENT balance
        uint256 _mentBalance = MentorToken(mentTokenAddress).balanceOf(
            _creator
        );
        // check if _creator is qualified for the level
        require(
            _mentBalance >= _exptLevel.requiredMent,
            "Not qualified for level!"
        );
        // check if there is a difference in EXPT to be claimed
        require(
            _exptLevel.receivableExpt > _creatorTickets[_creator],
            "Level has already been claimed!"
        );
        // Calculate remaining quantity to receive
        return _exptLevel.receivableExpt - _creatorTickets[_creator];
    }

    /**
     * @dev Adds content with _id to allow for voting to begin.
     */
    function addContent(bytes32 _id) public {
        // Retrieve Content Vote
        ContentVote storage _contentVote = _contentVotes[_id];
        // Check if no creator has been set already
        require(_contentVote.creator == address(0), "Creator already exists!");
        // Set msg.sender as creater
        _contentVote.creator = msg.sender;
        // Emit Event
        emit ContentAdded(msg.sender, _id);
    }

    /**
     * @dev Allows upvoting of content with _id.
     */
    function upVoteContent(bytes32 _id) public whenNotPaused {
        // Retrieve Content Vote
        ContentVote storage _contentVote = _contentVotes[_id];
        // Ensure Content has creator
        require(
            _contentVote.creator != address(0),
            "Voting not allowed for content without creator!"
        );
        // Check if msg.sender has not upvoted
        require(
            !_contentVote.memberVotes[msg.sender].upVoted,
            "Member has already up voted!"
        );
        // Retrieve Creator Vote
        CreatorVote storage _creatorVote = _creatorVotes[_contentVote.creator];
        // Check If Claim Rules Prevents Member from voting
        require(
            _contentVote.memberVotes[msg.sender].lastVotedAt == 0 ||
                _creatorVote.lastClaimedAt == 0 ||
                (_creatorVote.lastClaimedAt <
                    _contentVote.memberVotes[msg.sender].lastVotedAt),
            "Cannot Vote Again Due to Claim Rules!"
        );
        // Reverse if member has already downvoted
        if (_contentVote.memberVotes[msg.sender].downVoted) {
            // Decrement Creator & Content Down Votes
            _creatorVote.downVotes--;
            _contentVote.downVotes--;
            // Update Member Down Voted
            _contentVote.memberVotes[msg.sender].downVoted = false;
        }
        // Increment Creator & Content Up Votes
        _creatorVote.upVotes++;
        _contentVote.upVotes++;
        // Update Member Up Voted
        _contentVote.memberVotes[msg.sender].upVoted = true;
        // Update Member Last Voted
        _contentVote.memberVotes[msg.sender].lastVotedAt = block.number;
        // Emit Event
        emit ContentUpVoted(_id, _contentVote.upVotes);
    }

    /**
     * @dev Allows downvoting of content with _id.
     */
    function downVoteContent(bytes32 _id) public whenNotPaused {
        // Retrieve Content Vote
        ContentVote storage _contentVote = _contentVotes[_id];
        // Ensure Content has creator
        require(
            _contentVote.creator != address(0),
            "Voting not allowed for content without creator!"
        );
        // Check if msg.sender has not downvoted the content
        require(
            !_contentVote.memberVotes[msg.sender].downVoted,
            "Member has already down voted!"
        );
        // Retrieve Creator Vote
        CreatorVote storage _creatorVote = _creatorVotes[_contentVote.creator];
        // Check If Claim Rules Prevents Member from voting
        require(
            _contentVote.memberVotes[msg.sender].lastVotedAt == 0 ||
                _creatorVote.lastClaimedAt == 0 ||
                (_creatorVote.lastClaimedAt <
                    _contentVote.memberVotes[msg.sender].lastVotedAt),
            "Cannot Vote Again Due to Claim Rules!"
        );
        // Reverse if member has already upvoted
        if (_contentVote.memberVotes[msg.sender].upVoted) {
            // Decrement Creator & Content Up Votes
            _creatorVote.upVotes--;
            _contentVote.upVotes--;
            // Update Member Up Voted
            _contentVote.memberVotes[msg.sender].upVoted = false;
        }
        // Increment Creator & Content Down Votes
        _creatorVote.downVotes++;
        _contentVote.downVotes++;
        // Update Member Down Voted
        _contentVote.memberVotes[msg.sender].downVoted = true;
        // Update Member Last Voted
        _contentVote.memberVotes[msg.sender].lastVotedAt = block.number;
        // Emit Event
        emit ContentDownVoted(_id, _contentVote.downVotes);
    }

    /**
     * @dev Allows mentor to claim MENT.
     */
    function claimMent() public whenPaused {
        // Ensure mentTokenAddress is not the zero address
        require(mentTokenAddress != address(0), "MENT claiming is disabled!");
        // Retrieve Creator Vote
        CreatorVote storage _creatorVote = _creatorVotes[msg.sender];
        // Compute claimable MENT
        int256 _claimableMent = ((int256(_creatorVote.upVotes) -
            int256(_creatorVote.lastClaimedUpVotes)) *
            int256(upVoteMultiplier)) -
            ((int256(_creatorVote.downVotes) -
                int256(_creatorVote.lastClaimedDownVotes)) *
                int256(downVoteMultiplier));
        // Check if Content Vote has votes to claim
        require(_claimableMent > 0, "No MENT to claim!");
        // Mint MENT Tokens for Creator
        MentorToken(mentTokenAddress).mint(msg.sender, uint256(_claimableMent));
        // Update Content Last Claimed, UpVotes & DownVotes
        _creatorVote.lastClaimedAt = block.number;
        _creatorVote.lastClaimedUpVotes = _creatorVote.upVotes;
        _creatorVote.lastClaimedDownVotes = _creatorVote.downVotes;
        // Emit Event
        emit MentClaimed(msg.sender, uint256(_claimableMent));
    }

    /**
     * @dev Allows mentor to claim EXPT for a level _level.
     */
    function claimExpt(uint256 _level) public {
        // Check If exptTokenAddress is not address(0)
        require(exptTokenAddress != address(0), "EXPT claiming is disabled!");
        // Retrieve Expt Level
        ExptLevel storage _exptLevel = exptLevels[_level];
        // Check if expt level exists
        require(_exptLevel.requiredMent > 0, "Expt Level does not exists!");
        // Get msg.sender MENT balance
        uint256 _mentBalance = MentorToken(mentTokenAddress).balanceOf(
            msg.sender
        );
        // check if msg.sender is qualified for the level
        require(
            _mentBalance >= _exptLevel.requiredMent,
            "Not qualified for level!"
        );
        // check if there is a difference in EXPT to be claimed
        require(
            _exptLevel.receivableExpt > _creatorTickets[msg.sender],
            "Level has already been claimed!"
        );
        // Calculate remaining quantity to receive
        uint256 _quantity = _exptLevel.receivableExpt -
            _creatorTickets[msg.sender];
        // Mint EXPT for msg.sender
        ExpertToken(exptTokenAddress).mint(msg.sender, _quantity);
        // Increase _creatorTickets
        _creatorTickets[msg.sender] = _exptLevel.receivableExpt;
        // Emit Event
        emit ExptClaimed(msg.sender, _quantity);
    }

    /**
     * @dev Allows mentor to offer their EXPT tokens for sale.
     */
    function offerExpts(
        uint256[] memory _tokenIds,
        address _stablecoin,
        uint256 _amount
    ) external {
        // Require this isApproval for all EXPTs
        require(
            ExpertToken(exptTokenAddress).isApprovedForAll(
                msg.sender,
                address(this)
            ),
            "Marketplace Is Not Approval For All!"
        );
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            // Transfer _tokenIds[i] to this
            ExpertToken(exptTokenAddress).transferFrom(
                msg.sender,
                address(this),
                _tokenIds[i]
            );
            // Add _tokenIds[i] to marketplace offers
            exptOffers[_tokenIds[i]] = ExptOffer(
                msg.sender,
                _tokenIds[i],
                _stablecoin,
                _amount
            );
            // Emit event
            emit ExptDeposited(msg.sender, _tokenIds[i]);
        }
    }

    /**
     * @dev Allows member to buy EXPT.
     */
    function buyExpt(uint256 _tokenId) public {
        try ExpertToken(exptTokenAddress).ownerOf(_tokenId) returns (
            address _owner
        ) {
            // Check if _tokenId belongs to this
            require(_owner == address(this), "No deposit yet for token id!");
            // Retrieve Expt Offer
            ExptOffer storage _exptOffer = exptOffers[_tokenId];
            // Check if msg.sender has approved amount of payment token to this
            require(
                ERC20(_exptOffer.stablecoin).allowance(
                    msg.sender,
                    address(this)
                ) >= _exptOffer.amount,
                "Insufficient payment token allowance for marketplace!"
            );
            // Deduct Fees for EMT Marketplace @ 2%
            uint256 _fees = (_exptOffer.amount * exptBuyFeePercent) / 100;
            ERC20(_exptOffer.stablecoin).transferFrom(
                msg.sender,
                address(this),
                _fees
            );
            // Transfer payment token to seller
            ERC20(_exptOffer.stablecoin).transferFrom(
                msg.sender,
                _exptOffer.owner,
                _exptOffer.amount - _fees
            );
            // Transfer expt token to buyer
            ExpertToken(exptTokenAddress).transferFrom(
                address(this),
                msg.sender,
                _tokenId
            );
            // Emit event
            emit ExptBought(msg.sender, _tokenId);
        } catch Error(string memory reason) {
            revert(reason);
        }
    }

    /**
     * @dev Allows mentor to withdraw EXPT from sale.
     */
    function withdrawExpt(uint256 _tokenId) public {
        try ExpertToken(exptTokenAddress).ownerOf(_tokenId) returns (
            address _owner
        ) {
            require(_owner == address(this), "No deposit yet for token id!");
            // Retrieve Expt Offer
            ExptOffer storage _exptOffer = exptOffers[_tokenId];
            // check if msg.sender is seller or owner
            require(
                msg.sender == _exptOffer.owner,
                "Not eligible to withdraw EXPT!"
            );
            // transfer expt back to msg.sender
            ExpertToken(exptTokenAddress).transferFrom(
                address(this),
                msg.sender,
                _tokenId
            );
            // emit event
            emit ExptWithdrawn(msg.sender, _tokenId);
        } catch Error(string memory reason) {
            revert(reason);
        }
    }
}

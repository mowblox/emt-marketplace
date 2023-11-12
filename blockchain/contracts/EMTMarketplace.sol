// SPDX-License-Identifier: APACHE
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./MentorToken.sol";

/// @custom:security-contact odafe@mowblox.com
contract EMTMarketplace is Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Event Definitions
    event ContentUpVoted(uint256 indexed, uint256);
    event ContentDownVoted(uint256 indexed, uint256);
    event MentClaimed(address indexed, uint256);
    event ContentAdded(address indexed, uint256);

    // Public Data Definitions
    address public mentTokenAddress;
    uint256 public upVoteWeight = 10;
    uint256 public downVoteWeight = 5;
    // Private Data Definitions
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
    mapping(uint256 => ContentVote) _contentVotes;
    mapping(address => CreatorVote) _creatorVotes;

    // Constructor
    constructor(address defaultAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, defaultAdmin);
    }

    // Function Definitions
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function setMentToken(
        address _mentTokenAddress
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        mentTokenAddress = _mentTokenAddress;
    }

    function setUpVoteWeight(
        uint256 _upVoteWeight
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        upVoteWeight = _upVoteWeight;
    }

    function setDownVoteWeight(
        uint256 _downVoteWeight
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        downVoteWeight = _downVoteWeight;
    }

    // For a particular content with _id it return 3 bools for upvotes, downvotes and net votes
    function contentVotes(
        uint256 _id
    ) public view returns (uint256, uint256, int256) {
        return (
            _contentVotes[_id].upVotes,
            _contentVotes[_id].downVotes,
            int256(_contentVotes[_id].upVotes) -
                int256(_contentVotes[_id].downVotes)
        );
    }

    // For a particular content with _id it returns bool for both if _member has upvoted or downvoted the content
    function memberVotes(
        uint256 _id,
        address _member
    ) public view returns (bool, bool) {
        return (
            _contentVotes[_id].memberVotes[_member].upVoted,
            _contentVotes[_id].memberVotes[_member].downVoted
        );
    }

    function addContent(uint256 _id) public {
        // Retrieve Content Vote
        ContentVote storage _contentVote = _contentVotes[_id];
        // Check if no creator has been set already
        require(_contentVote.creator == address(0), "Creator already exists!");
        // Set msg.sender as creater
        _contentVote.creator = msg.sender;
        // Emit Event
        emit ContentAdded(msg.sender, _id);
    }

    function upVoteContent(uint256 _id) public whenNotPaused {
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

    function downVoteContent(uint256 _id) public whenNotPaused {
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

    function claimMent() public whenPaused {
        // Ensure mentTokenAddress is not the zero address
        require(mentTokenAddress != address(0), "Claiming is disabled!");
        // Retrieve Creator Vote
        CreatorVote storage _creatorVote = _creatorVotes[msg.sender];
        // Compute claimable MENT
        int256 _claimableMent = ((int256(_creatorVote.upVotes) -
            int256(_creatorVote.lastClaimedUpVotes)) * int256(upVoteWeight)) -
            ((int256(_creatorVote.downVotes) -
                int256(_creatorVote.lastClaimedDownVotes)) *
                int256(downVoteWeight));
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
}

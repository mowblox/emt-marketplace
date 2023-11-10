// SPDX-License-Identifier: APACHE
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./MentorToken.sol";

/// @custom:security-contact odafe@mowblox.com
contract EMTMarketplace is AccessControl {
    // Event Definitions
    event ContentUpVoted(uint256 indexed, uint256);
    event ContentDownVoted(uint256 indexed, uint256);

    // Public Data Definitions
    address public mentTokenAddress;
    uint256 public upVoteWeight = 10;
    uint256 public downVoteWeight = 5;
    // Private Data Definitions
    mapping(uint256 => uint256) _contentUpVotes;
    mapping(uint256 => uint256) _contentDownVotes;
    mapping(address => mapping(uint256 => bool)) _memberUpVotes;
    mapping(address => mapping(uint256 => bool)) _memberDownVotes;

    // Constructor
    constructor(address defaultAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    // Function Definitions
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

    function contentVotes(
        uint256 _id
    ) public view returns (uint256, uint256, int256) {
        return (
            _contentUpVotes[_id],
            _contentDownVotes[_id],
            int256(_contentUpVotes[_id]) - int256(_contentDownVotes[_id])
        );
    }

    function memberUpVotes(uint256 _id) public view returns (bool) {
        return _memberUpVotes[msg.sender][_id];
    }

    function memberDownVotes(uint256 _id) public view returns (bool) {
        return _memberDownVotes[msg.sender][_id];
    }

    function upVoteContent(uint256 _id, address _mentor) public {
        // Check if MENT Token is not address zero
        require(mentTokenAddress != address(0), "Ment Token is Address Zero!");
        // Check if msg.sender has not upvoted
        require(
            !_memberUpVotes[msg.sender][_id],
            "Member has already up voted!"
        );
        // Reverse if member has already downvoted
        if (_memberDownVotes[msg.sender][_id]) {
            // Decrement Content Down Vote
            _contentDownVotes[_id]--;
            // Update Member Down Votes Status
            _memberDownVotes[msg.sender][_id] = false;
        }
        // Increment Content Up Vote Vote
        _contentUpVotes[_id]++;
        // Update Member Up Votes Status
        _memberUpVotes[msg.sender][_id] = true;
        // Mint MENT Token for Content Creator
        MentorToken(mentTokenAddress).mint(_mentor, upVoteWeight);
        // Emit Event
        emit ContentUpVoted(_id, _contentUpVotes[_id]);
    }

    function downVoteContent(uint256 _id, address _mentor) public {
        // Check if MENT Token is not address zero
        require(mentTokenAddress != address(0), "Ment Token is Address Zero!");
        // Check if msg.sender has not downvoted the content
        require(
            !_memberDownVotes[msg.sender][_id],
            "Member has already down voted!"
        );
        // Reverse if member has already upvoted
        if (_memberUpVotes[msg.sender][_id]) {
            // Decrement Content Up Vote
            _contentUpVotes[_id]--;
            // Update Member Up Votes Status
            _memberUpVotes[msg.sender][_id] = false;
        }
        // Increment Content Down Vote
        _contentDownVotes[_id]++;
        // Update Member Down Votes Status
        _memberDownVotes[msg.sender][_id] = true;
        // Burn MENT Token for Content Creator if Balance is greater than zero
        uint256 _mentBalance = MentorToken(mentTokenAddress).balanceOf(_mentor);
        if (_mentBalance > 0) {
            MentorToken(mentTokenAddress).burnAsMinter(
                _mentor,
                Math.min(downVoteWeight, _mentBalance)
            );
        }
        // Emit Event
        emit ContentDownVoted(_id, _contentDownVotes[_id]);
    }
}

// SPDX-License-Identifier: APACHE
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./MentorToken.sol";

/// @custom:security-contact odafe@mowblox.com
contract EMTMarketplace is AccessControl {
    // Event Definitions
    event ContentUpVoted(uint256 indexed, uint256);
    event ContentDownVoted(uint256 indexed, uint256);

    // Data Definitions
    address _MENT_TOKEN_ADDRESS;
    uint256 _UPVOTE_WEIGHT = 10;
    uint256 _DOWNVOTE_WEIGHT = 5;
    mapping(uint256 => uint256) _contentVotes;
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
        _MENT_TOKEN_ADDRESS = _mentTokenAddress;
    }

    function setUpVoteWeight(
        uint256 _upVoteWeight
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _UPVOTE_WEIGHT = _upVoteWeight;
    }

    function setDownVoteWeight(
        uint256 _downVoteWeight
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _DOWNVOTE_WEIGHT = _downVoteWeight;
    }

    function contentVotes(uint256 _id) public view returns (uint256) {
        return _contentVotes[_id];
    }

    function memberUpVotes(uint256 _id) public view returns (bool) {
        return _memberUpVotes[msg.sender][_id];
    }

    function memberDownVotes(uint256 _id) public view returns (bool) {
        return _memberDownVotes[msg.sender][_id];
    }

    function upVoteContent(uint256 _id, address _mentor) public {
        // Check if MENT Token is not address zero
        require(
            _MENT_TOKEN_ADDRESS != address(0),
            "Ment Token is Address Zero!"
        );
        // Check if msg.sender has not upvoted
        require(
            !_memberUpVotes[msg.sender][_id],
            "Member has already up voted!"
        );
        // Increment Content Vote
        _contentVotes[_id]++;
        // Update Member Votes Status
        _memberUpVotes[msg.sender][_id] = true;
        _memberDownVotes[msg.sender][_id] = false;
        // Mint MENT Token for Content Creator (should the mentor address to passed in as an argument or stored on the blockchain?)
        MentorToken(_MENT_TOKEN_ADDRESS).mint(_mentor, _UPVOTE_WEIGHT);
        // Emit Event
        emit ContentUpVoted(_id, _contentVotes[_id]);
    }

    function downVoteContent(uint256 _id, address _mentor) public {
        // Check if MENT Token is not address zero
        require(
            _MENT_TOKEN_ADDRESS != address(0),
            "Ment Token is Address Zero!"
        );
        // Check if msg.sender has already up voted the content
        require(_memberUpVotes[msg.sender][_id], "Member has not up voted!");
        // Check if msg.sender has not downvoted the content
        require(
            !_memberDownVotes[msg.sender][_id],
            "Member has already down voted!"
        );
        // Decrement Content Vote
        _contentVotes[_id]--;
        // Update Member Votes Status
        _memberDownVotes[msg.sender][_id] = true;
        _memberUpVotes[msg.sender][_id] = false;
        // Burn MENT Token for Content Creator (should the mentor address to passed in as an argument or stored on the blockchain?)
        MentorToken(_MENT_TOKEN_ADDRESS).burnAsMinter(
            _mentor,
            _DOWNVOTE_WEIGHT
        );
        // Emit Event
        emit ContentDownVoted(_id, _contentVotes[_id]);
    }
}

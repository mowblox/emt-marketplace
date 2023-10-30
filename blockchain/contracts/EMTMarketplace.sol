// SPDX-License-Identifier: APACHE
pragma solidity ^0.8.20;

import "./MentorToken.sol";

contract EMTMarketplace {
    // Event Definitions

    event ContentUpVoted(string indexed, uint256);
    event ContentDownVoted(string indexed, uint256);

    // Data Definitions

    address _mentToken;
    mapping(string => uint256) _contentVotes;
    mapping(address => mapping(string => bool)) _memberUpVotes;
    mapping(address => mapping(string => bool)) _memberDownVotes;

    function setMentToken(address _MENT_TOKEN_ADDRESS) public {
        _mentToken = _MENT_TOKEN_ADDRESS;
    }

    // Function Definitions
    function contentVotes(string memory _id) public view returns (uint256) {
        return _contentVotes[_id];
    }

    function memberUpVotes(string memory _id) public view returns (bool) {
        return _memberUpVotes[msg.sender][_id];
    }

    function memberDownVotes(string memory _id) public view returns (bool) {
        return _memberDownVotes[msg.sender][_id];
    }

    function upVoteContent(string memory _id, address _mentor) public {
        // Check if MENT Token is not address zero
        require(_mentToken != address(0), "Ment Token is Address Zero!");
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
        MentorToken(_mentToken).mint(_mentor, 1);
        // Emit Event
        emit ContentUpVoted(_id, _contentVotes[_id]);
    }

    function downVoteContent(string memory _id, address _mentor) public {
        // Check if MENT Token is not address zero
        require(_mentToken != address(0), "Ment Token is Address Zero!");
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
        MentorToken(_mentToken).burnFrom(_mentor, 1);
        // Emit Event
        emit ContentDownVoted(_id, _contentVotes[_id]);
    }
}

// SPDX-License-Identifier: APACHE
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./MentorToken.sol";
import "./ExpertToken.sol";

/// @custom:security-contact odafe@mowblox.com
contract EMTMarketplace is Pausable, AccessControl, IERC721Receiver {
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
        address seller;
        address owner;
        uint256 tokenId;
        address paymentToken;
        uint256 amount;
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
    // Private Data Definitions
    mapping(bytes32 => ContentVote) _contentVotes;
    mapping(address => CreatorVote) _creatorVotes;
    mapping(address => uint256) _creatorTickets;

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

    function setTokenAddresses(
        address _mentTokenAddress,
        address _exptTokenAddress
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        mentTokenAddress = _mentTokenAddress;
        exptTokenAddress = _exptTokenAddress;
    }

    function setUpVoteMultiplier(
        uint256 _upVoteMultiplier
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        upVoteMultiplier = _upVoteMultiplier;
    }

    function setDownVoteMultiplier(
        uint256 _downVoteMultiplier
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        downVoteMultiplier = _downVoteMultiplier;
    }

    // For a particular content with _id it return 3 bools for upvotes, downvotes and net votes
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

    // For a particular content with _id it returns bool for both if _member has upvoted or downvoted the content
    function memberVotes(
        bytes32 _id,
        address _member
    ) public view returns (bool, bool) {
        return (
            _contentVotes[_id].memberVotes[_member].upVoted,
            _contentVotes[_id].memberVotes[_member].downVoted
        );
    }

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

    function claimExpt(uint256 _quantity) public {
        // Check If exptTokenAddress is not address(0)
        require(exptTokenAddress != address(0), "EXPT claiming is disabled!");
        // Check if _quantity is greater than 0
        require(_quantity > 0, "Cannot claim zero EXPT!");
        // Get msg.sender MENT balance
        uint256 _mentBalance = MentorToken(mentTokenAddress).balanceOf(
            msg.sender
        );
        // Check if claimed ticket plus _quantity is less or equal to threshold
        require(
            (_creatorTickets[msg.sender] + _quantity) <=
                (_mentBalance / exptTokenDivisor),
            "Quantity will exceed EXPT threshold!"
        );
        // Mint EXPT for msg.sender
        ExpertToken(exptTokenAddress).mint(msg.sender, _quantity);
        // Increase _creatorTickets
        _creatorTickets[msg.sender] += _quantity;
        // Emit Event
        emit ExptClaimed(msg.sender, _quantity);
    }

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
                ERC20(_exptOffer.paymentToken).allowance(
                    msg.sender,
                    address(this)
                ) >= _exptOffer.amount,
                "Insufficient payment token allowance for marketplace!"
            );
            // Deduct Fees for EMT Marketplace @ 2%
            uint256 _fees = (_exptOffer.amount * exptBuyFeePercent) / 100;
            ERC20(_exptOffer.paymentToken).transferFrom(
                msg.sender,
                address(this),
                _fees
            );
            // Transfer payment token to seller
            ERC20(_exptOffer.paymentToken).transferFrom(
                msg.sender,
                _exptOffer.seller,
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

    function withdrawExpt(uint256 _tokenId) public {
        try ExpertToken(exptTokenAddress).ownerOf(_tokenId) returns (
            address _owner
        ) {
            require(_owner == address(this), "No deposit yet for token id!");
            // Retrieve Expt Offer
            ExptOffer storage _exptOffer = exptOffers[_tokenId];
            // check if msg.sender is seller or owner
            require(
                msg.sender == _exptOffer.seller ||
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

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        try ExpertToken(exptTokenAddress).ownerOf(tokenId) returns (address) {
            // Require data exists
            require(data.length != 0, "Data is required for EXPT deposit!");
            // Decode data
            (address paymentToken, uint256 amount) = abi.decode(
                data,
                (address, uint256)
            );
            // Add tokeId to marketplace offers
            exptOffers[tokenId] = ExptOffer(
                operator,
                from,
                tokenId,
                paymentToken,
                amount
            );
            // Emit event
            emit ExptDeposited(operator, tokenId);
        } catch {}
        // Return to satisfy specification
        return this.onERC721Received.selector;
    }
}

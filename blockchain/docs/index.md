# Solidity API

## EMTMarketplace

### PAUSER_ROLE

```solidity
bytes32 PAUSER_ROLE
```

### MemberVote

```solidity
struct MemberVote {
  bool upVoted;
  bool downVoted;
  uint256 lastVotedAt;
}
```

### CreatorVote

```solidity
struct CreatorVote {
  uint256 upVotes;
  uint256 downVotes;
  uint256 lastClaimedUpVotes;
  uint256 lastClaimedDownVotes;
  uint256 lastClaimedAt;
}
```

### ContentVote

```solidity
struct ContentVote {
  address creator;
  uint256 upVotes;
  uint256 downVotes;
  mapping(address => struct EMTMarketplace.MemberVote) memberVotes;
}
```

### ExptOffer

```solidity
struct ExptOffer {
  address owner;
  uint256 tokenId;
  address stablecoin;
  uint256 amount;
}
```

### ExptLevel

```solidity
struct ExptLevel {
  uint256 requiredMent;
  uint256 receivableExpt;
}
```

### ContentAdded

```solidity
event ContentAdded(address, bytes32)
```

### ContentUpVoted

```solidity
event ContentUpVoted(bytes32, uint256)
```

### ContentDownVoted

```solidity
event ContentDownVoted(bytes32, uint256)
```

### MentClaimed

```solidity
event MentClaimed(address, uint256)
```

### ExptClaimed

```solidity
event ExptClaimed(address, uint256)
```

### ExptDeposited

```solidity
event ExptDeposited(address, uint256)
```

### ExptBought

```solidity
event ExptBought(address, uint256)
```

### ExptWithdrawn

```solidity
event ExptWithdrawn(address, uint256)
```

### mentTokenAddress

```solidity
address mentTokenAddress
```

### exptTokenAddress

```solidity
address exptTokenAddress
```

### upVoteMultiplier

```solidity
uint256 upVoteMultiplier
```

### downVoteMultiplier

```solidity
uint256 downVoteMultiplier
```

### exptTokenDivisor

```solidity
uint256 exptTokenDivisor
```

### exptBuyFeePercent

```solidity
uint256 exptBuyFeePercent
```

### exptOffers

```solidity
mapping(uint256 => struct EMTMarketplace.ExptOffer) exptOffers
```

### exptLevels

```solidity
mapping(uint256 => struct EMTMarketplace.ExptLevel) exptLevels
```

### _contentVotes

```solidity
mapping(bytes32 => struct EMTMarketplace.ContentVote) _contentVotes
```

### _creatorVotes

```solidity
mapping(address => struct EMTMarketplace.CreatorVote) _creatorVotes
```

### _creatorTickets

```solidity
mapping(address => uint256) _creatorTickets
```

### constructor

```solidity
constructor(address defaultAdmin) public
```

_Grants defaultAdmin & pauser roles._

### pause

```solidity
function pause() external
```

_Pauses marketplace to allow for MENT claiming._

### unpause

```solidity
function unpause() external
```

_Unpauses marketplace to allow voting._

### setTokenAddresses

```solidity
function setTokenAddresses(address _mentTokenAddress, address _exptTokenAddress) external
```

_Sets MENT & EXPT token addresses._

### setUpVoteMultiplier

```solidity
function setUpVoteMultiplier(uint256 _upVoteMultiplier) external
```

_Sets the up vote weight._

### setDownVoteMultiplier

```solidity
function setDownVoteMultiplier(uint256 _downVoteMultiplier) external
```

_Sets the down vote weight._

### setExptLevel

```solidity
function setExptLevel(uint256 _level, uint256 _requiredMent, uint256 _receivableExpt) external
```

_Sets expt level._

### creatorVotes

```solidity
function creatorVotes(address _creator) external view returns (uint256, uint256, int256)
```

_Returns creator's upvotes, downvotes & difference._

### contentVotes

```solidity
function contentVotes(bytes32 _id) public view returns (uint256, uint256, int256)
```

_Returns content's upvotes, downvotes & difference._

### memberVotes

```solidity
function memberVotes(bytes32 _id, address _member) public view returns (bool, bool)
```

_Returns member upvoted or downvoted status for a particular content id._

### unclaimedMent

```solidity
function unclaimedMent(address _creator) external view returns (int256)
```

_Returns unclaimed MENT for a creator._

### unclaimedExpt

```solidity
function unclaimedExpt(address _creator, uint256 _level) external view returns (uint256)
```

_Returns unclaimed EXPT for a creator._

### addContent

```solidity
function addContent(bytes32 _id) public
```

_Adds content with _id to allow for voting to begin._

### upVoteContent

```solidity
function upVoteContent(bytes32 _id) public
```

_Allows upvoting of content with _id._

### downVoteContent

```solidity
function downVoteContent(bytes32 _id) public
```

_Allows downvoting of content with _id._

### claimMent

```solidity
function claimMent() public
```

_Allows mentor to claim MENT._

### claimExpt

```solidity
function claimExpt(uint256 _level) public
```

_Allows mentor to claim EXPT for a level _level._

### offerExpts

```solidity
function offerExpts(uint256[] _tokenIds, address _stablecoin, uint256 _amount) external
```

_Allows mentor to offer their EXPT tokens for sale._

### buyExpt

```solidity
function buyExpt(uint256 _tokenId) public
```

_Allows member to buy EXPT._

### withdrawExpt

```solidity
function withdrawExpt(uint256 _tokenId) public
```

_Allows mentor to withdraw EXPT from sale._

## ExpertToken

### MINTER_ROLE

```solidity
bytes32 MINTER_ROLE
```

### constructor

```solidity
constructor(address defaultAdmin, address minter) public
```

### _baseURI

```solidity
function _baseURI() internal pure returns (string)
```

_Base URI for computing {tokenURI}. If set, the resulting URI for each
token will be the concatenation of the `baseURI` and the `tokenId`. Empty
by default, it can be overridden in child contracts._

### mint

```solidity
function mint(address to, uint256 quantity) public
```

### burnAsMinter

```solidity
function burnAsMinter(uint256 tokenId) public
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

## MentorToken

### MINTER_ROLE

```solidity
bytes32 MINTER_ROLE
```

### constructor

```solidity
constructor(address defaultAdmin, address minter) public
```

### mint

```solidity
function mint(address to, uint256 amount) public
```

### burnAsMinter

```solidity
function burnAsMinter(address account, uint256 value) public
```

### decimals

```solidity
function decimals() public view virtual returns (uint8)
```

_Returns the number of decimals used to get its user representation.
For example, if `decimals` equals `2`, a balance of `505` tokens should
be displayed to a user as `5.05` (`505 / 10 ** 2`).

Tokens usually opt for a value of 18, imitating the relationship between
Ether and Wei. This is the default value returned by this function, unless
it's overridden.

NOTE: This information is only used for _display_ purposes: it in
no way affects any of the arithmetic of the contract, including
{IERC20-balanceOf} and {IERC20-transfer}._

### _update

```solidity
function _update(address from, address to, uint256 amount) internal virtual
```

## StableCoin

### constructor

```solidity
constructor(string name, string symbol, address initialOwner) public
```

### mint

```solidity
function mint(address to, uint256 amount) public
```


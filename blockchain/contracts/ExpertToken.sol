// SPDX-License-Identifier: APACHE
pragma solidity ^0.8.20;

import "erc721a/contracts/extensions/ERC721ABurnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @custom:security-contact odafe@mowblox.com
contract ExpertToken is ERC721ABurnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(
        address defaultAdmin,
        address minter
    ) ERC721A("ExpertToken", "EXPT") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://mowblox.com/";
    }

    function mint(address to, uint256 quantity) public onlyRole(MINTER_ROLE) {
        _mint(to, quantity);
    }

    function burnAsMinter(uint256 tokenId) public onlyRole(MINTER_ROLE) {
        _burn(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(IERC721A, ERC721A, AccessControl) returns (bool) {
        return ERC721A.supportsInterface(interfaceId);
    }
}

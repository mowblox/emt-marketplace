// SPDX-License-Identifier: APACHE
pragma solidity ^0.8.20;

import "erc721a-upgradeable/contracts/ERC721AUpgradeable.sol";
import "erc721a-upgradeable/contracts/extensions/ERC721ABurnableUpgradeable.sol";
import "erc721a-upgradeable/contracts/extensions/ERC721AQueryableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/// @custom:security-contact odafe@mowblox.com
contract ExpertToken is
    ERC721AUpgradeable,
    ERC721ABurnableUpgradeable,
    ERC721AQueryableUpgradeable,
    AccessControlUpgradeable
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Take note of the initializer modifiers.
    // - `initializerERC721A` for `ERC721AUpgradeable`.
    // - `initializer` for OpenZeppelin's `OwnableUpgradeable`.
    function initialize(
        address defaultAdmin,
        address minter
    ) public initializerERC721A initializer {
        __ERC721A_init("ExpertToken", "EXPT");
        __ERC721ABurnable_init();
        __ERC721AQueryable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://emt-marketplace.vercel.app/api/metadatas/";
    }

    function mint(address to, uint256 quantity) public onlyRole(MINTER_ROLE) {
        _mint(to, quantity);
    }

    function burnAsMinter(uint256 tokenId) public onlyRole(MINTER_ROLE) {
        _burn(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(
            AccessControlUpgradeable,
            ERC721AUpgradeable,
            IERC721AUpgradeable
        )
        returns (bool)
    {
        return ERC721AUpgradeable.supportsInterface(interfaceId);
    }
}

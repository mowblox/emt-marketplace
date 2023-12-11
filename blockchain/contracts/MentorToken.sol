// SPDX-License-Identifier: APACHE
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @custom:security-contact odafe@mowblox.com
contract MentorToken is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    AccessControlUpgradeable
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address defaultAdmin,
        address minter
    ) public initializer {
        __ERC20_init("Mentor Token", "MENT");
        __ERC20Burnable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function burnAsMinter(
        address account,
        uint256 value
    ) public onlyRole(MINTER_ROLE) {
        // @Jovells suggest that we check back in the Marketplace Contract to see if downvote has actually happened.
        // @mickeymond thinks that since we are not doing it for minting, why do that for burning?
        // We can put any extra validation checks here if we want to before burning happens.
        _burn(account, value);
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        // Check If msg.sender has MINTER role
        // This makes MENT token non-transferrable
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
                hasRole(MINTER_ROLE, msg.sender),
            "MENT Token Not Tradable!"
        );
        // Continue with update logic
        super._update(from, to, amount);
    }
}

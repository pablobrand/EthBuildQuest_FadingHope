// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract FadingHopeToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC20("FadingHope", "FH") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function burn(address account, uint256 amount) public onlyRole(MINTER_ROLE) {
        _burn(account, amount);
    }

    // For infinite minting, the overflow number is around 10^77.
    function decimals() public pure override returns (uint8) {
        return 57;
    }
}

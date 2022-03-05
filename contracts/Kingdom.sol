// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IKingdom {
    // call master contract to mint owner money based on their kingdom infrastructor.
    function claimReward() external;
    function upgradeBuilding(uint256 _buildingId) external;
    // For later upgrade when we have new building. We want player can upgrade their NFT too.
    // The logic is run on admin contract (which is upgradable contract)
    function addNewBuilding(uint256 _buildingId, uint256 _buildingLevel) external;
}

contract Kingdom is ERC1155, AccessControl, IKingdom {

    uint256  constant public TOWN_CENTER = 0;
    uint256  constant public BARRACKS = 1;
    uint256  constant public WALL = 2;

    bytes32 constant public OWNER_ROLE = "owner";

    constructor(address _admin, address _owner) public {
        grantRole(DEFAULT_ADMIN_ROLE, _admin);
        grantRole(OWNER_ROLE, _owner);
    }


}

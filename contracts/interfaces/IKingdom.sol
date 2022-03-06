pragma solidity ^0.8.0;

/// Player Kingdom NFT interface
/// Hold storage: level of building
/// Kindom should be a NFT token have unique owner and share authority with master
interface IKingdom {
    
    function getName() external view returns (string memory);
    function getRuler() external view returns (address);

    // call master contract to mint owner money based on their kingdom level.
    function claimReward() external;

    // call master contract to burn owner token to exchange for upgrade.
    // should only be called by master contract and by owner
    function upgradeBuilding(uint256 _buildingId) external;

    // For later upgrade when we have new building. We want player can upgrade their NFT too.
    // The logic is run on admin contract (which is upgradable contract)
    function addNewBuilding(uint256 _buildingId, uint256 _buildingLevel) external;

    function getBuildingLevel(uint256 _buildingId) external view returns (uint256);

    // called by invader or master.
    function destroyKingdom(uint id) external;
}

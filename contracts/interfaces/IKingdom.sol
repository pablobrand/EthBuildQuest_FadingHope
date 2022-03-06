pragma solidity ^0.8.0;

/// Player Kingdom NFT interface
/// Hold storage: level of building
/// Kindom should be a NFT token have unique owner and share authority with master
interface IKingdom {
    
    function mint(address to, string memory kingdomName) external;
    

    function getName(uint tokenID) external view returns (string memory);
    function getRuler(uint tokenID) external view returns (address);

    // call master contract to mint owner money based on their kingdom level.
    function claimReward(uint tokenID) external;

    // call master contract to burn owner token to exchange for upgrade.
    // should only be called by master contract and by owner
    function upgradeBuilding(uint tokenID,uint256 _buildingId) external;

    function getBuildingLevel(uint256 tokenID,uint256 _buildingId) external view returns (uint256);
    function getBuildingsLevel(uint256 tokenID,uint256[] calldata _buildingId) external view returns (uint256[] memory);


    function getTokenURI (uint256 tokenId, bytes32 uri) external view returns (string memory) ;
    function getTokenURIs (uint256 tokenId, bytes32[] calldata uriList) external view returns (string[] memory) ;
    // called by invader or master.
    function destroyKingdom(uint tokenID) external;

    function setTokenURI (uint256 tokenId, bytes32 uri, string memory data) external;
    function setTokenURIs (uint256 tokenId, bytes32[] calldata uri, string[] calldata data) external;
    
}

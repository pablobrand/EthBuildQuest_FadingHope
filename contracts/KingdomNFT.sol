// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IKingdom.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// Kingdom NFT only store data in kingdom contract,
/// Logic will be handle on master contract.
/// Master contract have authority to change all kingdom data.
/// An extension version from ERC721Enumerable and ERC721URIStorage
/// Enumerable to query current address have how many kingdom token

contract KingdomNFT is AccessControl, ERC721Enumerable, IKingdom {
    using Strings for uint256;

    string private constant NFT_NAME = "Kingdom";
    string private constant NFT_SYMBOL = "KDM";

    constructor(address _admin) ERC721(NFT_NAME, NFT_SYMBOL) {
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl, ERC721Enumerable) returns (bool) {
        return interfaceId == type(IKingdom).interfaceId || super.supportsInterface(interfaceId);
    }

    /// Kingdom data storage logic ///

    bytes32 public constant URI_TOWNCENTER = keccak256("TownCenter");
    bytes32 public constant URI_BARRACK = keccak256("Barrack");
    bytes32 public constant URI_WALL = keccak256("Wall");
    bytes32 public constant URI_ICON = keccak256("Icon");

    /// The data required for a kingdom is intensive, this should be a proxy contract storage by its own.
    /// The NFT token is only enough for simple token, for more complex token, each token should be a contract with its own storage.
    struct KingdomData {
        uint256 lastClaimTime;
        mapping(uint256 => uint256) buildings; // Building level
        mapping(bytes32 => string) kingdomURIs; // like icon, title, description. We use default hash. If player set it, we show it.
        // Use constant hash above.
    }

    uint256 tokenCounter = 0;

    mapping(uint256 => string) private _tokenName;
    mapping(string => uint256) private _nameToToken;
    /// Each token have mapping to struct data. To store stuff like current army health, building level, multiple URI
    /// So we just hope there is no collision in storage. Use Hash and encode to find data (same as diamond facet).
    mapping(uint256 => KingdomData) private _tokenData;

    /// Mint new kingdom token
    /// All building start from level 0.
    /// Towncenter start from lv 1.
    function mint(address to, string memory kingdomName) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(bytes(kingdomName).length > 0, "Kingdom name cannot be empty");
        require(getTokenFromName(kingdomName) == 0, "Name already exist");

        tokenCounter++; // not use token 0

        uint256 tokenId = tokenCounter;
        _mint(to, tokenId);
        _tokenName[tokenId] = kingdomName;
        _nameToToken[kingdomName] = tokenId;

        KingdomData storage data = _tokenData[tokenId];
        data.buildings[0] = 1; // TownCenter
    }

    ///// IKingdom interface //////

    function getName(uint256 tokenID) external view override returns (string memory) {
        return _tokenName[tokenID];
    }

    function getTokenFromName(string memory kingdomName) internal view returns (uint256 tokenId) {
        return _nameToToken[kingdomName];
    }

    function getRuler(uint256 tokenId) external view override returns (address) {
        return ownerOf(tokenId);
    }

    // call master contract to mint owner money based on their kingdom level.
    function claimReward(uint256 tokenID) external override {}

    // call master contract to burn owner token to exchange for upgrade.
    // should only be called by master contract and by owner
    function upgradeBuilding(uint256 tokenID, uint256 _buildingId) external override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function getBuildingLevel(uint256 tokenID, uint256 _buildingId) external view override returns (uint256) {
        KingdomData storage data = _tokenData[tokenID];
        return data.buildings[_buildingId];
    }

    function getBuildingsLevel(uint256 tokenID, uint256[] calldata _buildingIds) external view override returns (uint256[] memory) {
        KingdomData storage data = _tokenData[tokenID];
        uint256[] memory result = new uint256[](_buildingIds.length);
        for (uint256 i = 0; i < _buildingIds.length; i++) {
            result[i] = data.buildings[_buildingIds[i]];
        }
        return result;
    }

    // called by invader or master.
    function destroyKingdom(uint256 tokenID) external override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function setTokenURI(
        uint256 tokenId,
        bytes32 uri,
        string memory data
    ) external override onlyOwnerOrAdmin(tokenId) {        
        _tokenData[tokenId].kingdomURIs[uri] = data;
    }

    function setTokenURIs(
        uint256 tokenId,
        bytes32[] calldata uri,
        string[] calldata data
    ) external override onlyOwnerOrAdmin(tokenId) {
        for (uint256 i = 0; i < uri.length; i++) {
            _tokenData[tokenId].kingdomURIs[uri[i]] = data[i];
        }
    }

    function getTokenURI(uint256 tokenId, bytes32 uri) external view override returns (string memory) {
        return _tokenData[tokenId].kingdomURIs[uri];
    }

    function getTokenURIs(uint256 tokenId, bytes32[] calldata uriList) external view override returns (string[] memory) {
        // return list of URI
        KingdomData storage data = _tokenData[tokenId];
        string[] memory result = new string[](uriList.length);
        for (uint256 i = 0; i < uriList.length; i++) {
            result[i] = data.kingdomURIs[uriList[i]];
        }
        return result;
    }

    /// Return default icon if have one.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string memory baseURI = _tokenData[tokenId].kingdomURIs[URI_ICON];
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
    }

    modifier onlyOwnerOrAdmin(uint tokenId) {
        require(_msgSender() == getRuler(tokenId) || 
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender())
        , "Only owner or admin can call this function");
        _;
    }
}

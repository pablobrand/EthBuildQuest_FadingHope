// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// Kingdom NFT only store data in kingdom contract,
/// Logic on master contract will allow to change storage of NFT token.
/// This was the limit of NFT token. If each NFT is its own contract, it will be much easier to manage storage.

/// An extension version from ERC721Enumerable and ERC721URIStorage
/// Enumerable allow query current address list of kingdom token

contract KingdomNFT is AccessControl, ERC721Enumerable {
    using Strings for uint256;

    string private constant NFT_NAME = "Kingdom";
    string private constant NFT_SYMBOL = "KDM";

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    constructor(address _admin) ERC721(NFT_NAME, NFT_SYMBOL) {
        _setupRole(DEFAULT_ADMIN_ROLE, _admin); // give original admin power to manage role
        _grantRole(ADMIN_ROLE, _admin);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    modifier onlyTokenOwnerOrAdmin(uint256 tokenId) {
        require(_msgSender() == ownerOf(tokenId)  || hasRole(ADMIN_ROLE,_msgSender()) , "Only token owner can call this function");
        _;
    }

    /// Kingdom data storage logic ///

    enum Building {
        TownCenter,
        Barracks,
        Wall
    }

    struct Kingdom {
        // kingdom name is unique and cannot change
        uint256 lastRewardClaimTime;
        bool underOccupation; // cut income in half if true.
        uint256[] buildingsLevel; // money value 
        string uri; // visual value
    }

    uint256 private tokenCounter = 0;

    mapping(uint256 => string) private _tokenName;
    mapping(string => uint256) private _nameToToken;
    /// Each token have mapping to struct data. To store stuff like current army health, building level, multiple URI
    /// So we just hope there is no collision in storage. Use Hash and encode to find data (same as diamond facet).
    mapping(uint256 => Kingdom) private _tokenData;

    event KingdomCreated(uint256 tokenID, string kingdomName, address owner);
    event KingdomBuildingUpgraded(uint256 tokenID, uint256 buildingId, uint256 level);
    event KingdomURIChanged(uint256 tokenID, string newUri);

    /// Mint new kingdom token
    /// All building start from level 0.
    /// Towncenter start from lv 1.
    function mint(address to, string memory kingdomName) external onlyRole(ADMIN_ROLE) returns (uint256) {
        require(bytes(kingdomName).length > 0, "Kingdom name cannot be empty");
        require(getTokenFromName(kingdomName) == 0, "Name already exist");

        tokenCounter++; // not use token 0

        uint256 tokenId = tokenCounter;
        _mint(to, tokenId);
        _tokenName[tokenId] = kingdomName;
        _nameToToken[kingdomName] = tokenId;

        Kingdom storage kingdom = _tokenData[tokenId];
        kingdom.lastRewardClaimTime = block.timestamp;
        kingdom.buildingsLevel = new uint256[](3);
        kingdom.buildingsLevel[0] = 1; // TownCenter lv 1
        emit KingdomCreated(tokenId, kingdomName, to);
        return tokenId;
    }

    ///// IKingdom interface //////

    function getRuler(uint256 tokenId) public view returns (address) {
        return ownerOf(tokenId);
    }

    function getName(uint256 tokenID) public view returns (string memory) {
        return _tokenName[tokenID];
    }

    function getTokenFromName(string memory kingdomName) public view returns (uint256 tokenId) {
        return _nameToToken[kingdomName];
    }

    function getURIFromName(string memory kingdomName) public view returns (string memory uri) {
        return _tokenData[_nameToToken[kingdomName]].uri;
    }

    function getBuildingLevel(uint256 tokenId, Building building) public view returns (uint256 level) {
        return _tokenData[tokenId].buildingsLevel[uint256(building)];
    }

    function getLastClaimTime(uint256 tokenId) public view returns (uint256) {
        return _tokenData[tokenId].lastRewardClaimTime;
    }

    function getOccupation(uint256 tokenID) public view returns (bool) {
        return _tokenData[tokenID].underOccupation;
    }

    ///// Master contract function
    function setClaimTime(uint256 tokenID, uint256 time) external onlyRole(ADMIN_ROLE) {
        Kingdom storage data = _tokenData[tokenID];
        data.lastRewardClaimTime = time;
    }

    function setOccupation(uint256 tokenID, bool occupation) external onlyRole(ADMIN_ROLE) {
        Kingdom storage data = _tokenData[tokenID];
        data.underOccupation = occupation;
    }

    // call master contract to burn owner token to exchange for upgrade.
    // should only be called by master contract and by owner
    function setBuildingLevel(
        uint256 tokenID,
        uint256 _buildingId,
        uint256 level
    ) external onlyRole(ADMIN_ROLE) {
        Kingdom storage data = _tokenData[tokenID];
        data.buildingsLevel[_buildingId] = level;
        emit KingdomBuildingUpgraded(tokenID, _buildingId, level);
    }

    // called by invader or master.
    function destroyKingdom(uint256 tokenID) external onlyRole(ADMIN_ROLE) {
        _burn(tokenID);
    }

    /// every time player change portrait,flag, we push new IPFS URI to kingdom contract.
    function setTokenURI(
        uint256 tokenId,        
        string memory newUri
    ) external onlyTokenOwnerOrAdmin(tokenId) {
        _tokenData[tokenId].uri = newUri;
        emit KingdomURIChanged(tokenId,  newUri);
    }

    /// Return default icon if have one.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string memory baseURI = _tokenData[tokenId].uri;
        return bytes(baseURI).length > 0 ? baseURI : "";
    }
}

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

contract Kingdom is AccessControl, ERC721Enumerable {

    string private constant NFT_NAME = "Kingdom";
    string private constant NFT_SYMBOL = "KDM";

    constructor(address _admin) ERC721(NFT_NAME, NFT_SYMBOL) {
        grantRole(DEFAULT_ADMIN_ROLE, _admin);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl, ERC721Enumerable) returns (bool) {
        return interfaceId == type(IERC721Enumerable).interfaceId || super.supportsInterface(interfaceId);
    }

    bytes32 public constant URI_TOWNCENTER = sha256("TownCenter");
    bytes32 public constant URI_BARRACK = sha256("Barrack");
    bytes32 public constant URI_WALL = sha256("Wall");

    struct KingdomData {
        mapping(uint256 => uint256) buildings; // Building level
        mapping(bytes32 => string) kingdomURIs; // like icon, title, description. We use default hash. If player set it, we show it.
        // Use constant hash above.
    }

    mapping(uint256 => string) private _tokenName;
    /// Each token have mapping to struct data. To store stuff like current army health, building level, multiple URI
    /// So we just hope there is no collision in storage. Use Hash and encode to find data (same as diamond facet).
    mapping(uint256 => KingdomData) private _tokenData;
}

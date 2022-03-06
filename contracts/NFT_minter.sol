// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SmartContract is ERC721, Ownable {
    //creating the Token
    constructor() ERC721("Fading Hope", "FH") {}

    using Counters for Counters.Counter;

    using Strings for uint256;

    Counters.Counter _tokenIds;

    //The struct for each Kingdom
    struct RenderNFT {
        string uri;
        uint256 hp;
        uint256 attackDamage;
    }

    mapping(uint256 => RenderNFT) _tokenDetails;
    mapping(address => uint256) public nftHolderCount;
    mapping(uint256 => address) public nftToHolder;

    function mint(
        string memory uri,
        uint256 hp,
        uint256 attackDamage
    ) public returns (uint256) {
        uint256 newId = _tokenIds.current();
        _tokenDetails[newId] = RenderNFT(uri, hp, attackDamage);
        nftHolderCount[msg.sender] = nftHolderCount[msg.sender] + 1;
        nftToHolder[newId] = msg.sender;
        _mint(msg.sender, newId);

        // Where this function is called? You push missing function bruno
        // _setTokenURI(newId, uri);

        _tokenIds.increment();
        return newId;
    }

    function getNFTsByOwner(address _owner) external view returns (uint256[] memory) {
        uint256 lastestId = _tokenIds.current();
        uint256[] memory result = new uint256[](nftHolderCount[_owner]);
        uint256 counter = 0;
        for (uint256 i = 0; i < lastestId; i++) {
            if (nftToHolder[i] == _owner) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }

    function getNFTsById(uint256 _tokenId) public view returns (RenderNFT memory) {
        return _tokenDetails[_tokenId];
    }
}

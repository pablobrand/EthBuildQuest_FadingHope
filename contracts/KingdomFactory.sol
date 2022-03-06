// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IFactory.sol";
import "./Kingdom.sol";

// Create a clone contract of Kingdom NFT. And setup it based on input
// Setup NFT owner, id, name. The rest let player change by themselves
// Give building lv 0
// Set last reward block to current time
// to find owner current NFT. Solidity do not support this directly.
// The mint master contract should store this manually.
// When transfer to new owner, the owner should call this registry to update the owner mapping.

contract KingdomFactory is AccessControl, IFactory {
    address public admin;

    mapping(bytes32 => IKingdom) public kingdomRegister;

    constructor(address _admin) {
        grantRole(DEFAULT_ADMIN_ROLE, _admin);
        admin = _admin;
    }

    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return interfaceId == type(IFactory).interfaceId || super.supportsInterface(interfaceId);
    }

    function mintNFT(address owner, string memory id) external override onlyRole(DEFAULT_ADMIN_ROLE) returns (address) {
        Kingdom kingdom = new Kingdom(admin, owner, id);
        kingdomRegister[sha256(abi.encodePacked(id))] = kingdom;
        return address(kingdom);
    }

    function getNFTbyID(bytes32 id) public view returns (address nftAddress){
        return address(kingdomRegister[id]);
    }

    function getNFTname(address nftAddress) public view returns (string memory) {
        Kingdom kingdom = Kingdom(nftAddress);
        return kingdom.getName();
    }

    function getNFTNameFromID(bytes32 id) public view returns (string memory) {
        return getNFTname(getNFTbyID(id));
    }
}

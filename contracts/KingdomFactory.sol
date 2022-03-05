// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IFactory.sol";

// Create a clone contract of Kingdom NFT. And setup it based on input
// Setup NFT owner, id, name. The rest let player change by themselves
// Give building lv 0
// Set last reward block to current time
contract KingdomFactory is IFactory {

}

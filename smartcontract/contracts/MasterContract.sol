// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface IMasterContract {

    function MintPlayerKingdom(address player, bytes32 name) external returns (IERC20);
    
    function IsNameExist(bytes32 name) external returns (bool);
    function GetPlayerKingdom(address player) external returns (IERC20);
    function GetPlayerKingdomName(address player) external returns (bytes32);
    function GetPlayerKingdomNameString(address player) external returns (string calldata);
}
/// This master contract have size limit. So split logic of factory to their own file.
/// This should implement diamond/facet storage contract but it was too complicated for hackathon.
/// So this contract will handle most of logic in game without modular code.
contract MasterContract is Ownable, IMasterContract{



}
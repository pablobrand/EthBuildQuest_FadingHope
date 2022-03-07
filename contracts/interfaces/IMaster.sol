// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IKingdom.sol";
import "./IUnit.sol";

/// Handle most logic of the game.
/// Storage will be store NFT. And NFT just redirect most function authority to master.
/// Master must have write access to NFT storage to apply change.
/// master should have no need to know about current status of NFT or who is the owner.
/// Master should only have pure logic, change storage of input NFT.
/// It much simpler if we design contract this way
interface IMaster {
/// Mint
    function MintPlayerKingdom(address player, bytes32 name) external returns (IKingdom);
    function MintNewUnit(IKingdom kingdom, bytes32 name) external returns (IUnit);

    /// Function for frontend check before mint
    function IsNameExist(bytes32 name) external returns (bool);

    function IsUnitExist(bytes32 name) external returns (bool);



/// Logic gameplay function
    function ClaimKingdomReward(IKingdom kingdom) external;

    function BurnKingdom(IKingdom kingdom) external;

    function AttackKingdom(IKingdom from, IKingdom target, string calldata reason) external;
    
    function SendGlobalMessage(string calldata message) external;
    function PinGlobalMessage(string memory message) external;

    event AttackKingdomEvent(IKingdom from, IKingdom target, string justification);
    event BurnKingdomEvent(IKingdom kingdom, address attacker);
    event ClaimKingdomRewardEvent(IKingdom kingdom, uint amount);
    event GlobalMessageEvent(string message);
    event PinGlobalMessageEvent(string message);

}

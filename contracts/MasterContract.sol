// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ChatSystem.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./KingdomNFT.sol";
import "./GameConfig.sol";

/// This master contract have size limit.
/// This should implement diamond/facet storage contract but it was too complicated for hackathon.

/// So this contract will handle most of logic in game without modular code.
/// Store most of logic here.
/// The master contract have authority to change storage on NFT.
/// But the complexity to write set/get function for all kind of static storage is too long to implemented.

contract MasterContract is Ownable, ChatSystem, GameConfig {
    KingdomNFT public kingdoms;
    IERC20 public token;

    constructor(IERC20 gameToken, KingdomNFT gameKingdoms) {
        token = gameToken;
        kingdoms = gameKingdoms;
    }

    function freeMint(address _to, string memory kingdomName) external {
        kingdoms.mint(_to, kingdomName);
    }

    /// To mint new kingdom, only owner of another kingdom can mint.
    /// Some penalty will be enforced. To have cost of creating new kingdom.
    function MintPlayerKingdom(
        uint256 kingdomTokenId,
        address to,
        string calldata kingdomName
    ) external  {
        require(kingdoms.getRuler(kingdomTokenId) == _msgSender(), "not ruler of kingdom");
        // TODO : set penalty for creating new kingdom
        kingdoms.mint(to, kingdomName);
    }

    function MintNewUnit(uint256 tokenId, bytes32 name) external{}

    function ClaimKingdomReward(uint256 tokenId) external{}

    function BurnKingdom(uint256 tokenId) external{}

    function AttackKingdom(
        uint256 fromTokenId,
        uint256 targetTokenId,
        string calldata reason
    ) external{}
}

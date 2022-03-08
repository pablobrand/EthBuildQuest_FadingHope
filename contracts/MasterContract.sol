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

    /// Setup data Function
    function SetBuildingCost(uint256 buildingId, uint256[] calldata _upgradeCost) external onlyOwner {
        for (uint256 i = 0; i < _upgradeCost.length; i++) {
            buildingCosts[buildingId][i] = _upgradeCost[i];
        }
    }

    /// Setup data Function
    function SetTownCenterIncome(uint256[] calldata incomePerSec) external onlyOwner {
        for (uint256 i = 0; i < incomePerSec.length; i++) {
            towncenterIncomePerSecond[i] = incomePerSec[i];
        }
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
    ) external {
        require(kingdoms.getRuler(kingdomTokenId) == _msgSender(), "not ruler of kingdom");
        // TODO : set penalty for creating new kingdom
        kingdoms.mint(to, kingdomName);
    }

    function MintNewUnit(uint256 tokenId, bytes32 name) external {}

    function ClaimKingdomReward(uint256 tokenId) external {
        uint256 lastClaimTime = kingdoms.getLastClaimTime(tokenId);
        require(block.timestamp > lastClaimTime, "can't claim reward before claim time");
        uint256 timePassed = block.timestamp - lastClaimTime;
        uint256 lv = kingdoms.getBuildingLevel(tokenId, KingdomNFT.Building.TownCenter);
        uint256 reward = timePassed * getPlayerRewards(tokenId, lv);
        
        kingdoms.setClaimTime(tokenId, block.timestamp);
    }

    function BurnKingdom(uint256 tokenId) external {}

    function AttackKingdom(
        uint256 fromTokenId,
        uint256 targetTokenId,
        string calldata reason
    ) external {}
}

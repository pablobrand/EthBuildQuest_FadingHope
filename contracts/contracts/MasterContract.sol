// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./ChatSystem.sol";
import "./FadingHopeToken.sol";
import "./KingdomNFT.sol";
import "./utils/Minting.sol";
import "./IMintable.sol";
/// This master contract have size limit.
/// This should implement diamond/facet storage contract but it was too complicated for hackathon.

/// So this contract will handle most of logic in game without modular code.
/// Store most of logic here.
/// The master contract have authority to change storage on NFT.
/// But the complexity to write set/get function for all kind of static storage is too long to implemented.

contract MasterContract is Ownable, ChatSystem {
    using Strings for uint256;
    KingdomNFT public kingdoms;
    FadingHopeToken public token;
    constructor(FadingHopeToken gameToken, KingdomNFT gameKingdoms) {
        token = gameToken;
        kingdoms = gameKingdoms;
    }

    // Game Config
    uint256 public mintKingdomPenalty = 1 days;
    uint256 public mintKingdomPenaltyMultiplier = 2;

    // Income and building cost will be fixed for now
    // Calculated through excel formular and store it onchain.

    mapping(uint256 => uint256[256]) public buildingCosts;
    mapping(uint256 => bytes) public blueprints;
    uint256[256] towncenterIncomePerSecond;

    /// GetPlayerReward based on time passed
    function calculateTownIncome(uint256 buildingLevel, uint256 timePassed) public view returns (uint256) {
        return timePassed * towncenterIncomePerSecond[buildingLevel];
    }

    function getBuildingCost(uint256 buildingId, uint256 buildingLevel) public view returns (uint256) {
        return buildingCosts[buildingId][buildingLevel];
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
    function freeMintWithURI(address _to, string memory kingdomName, string memory uri) external {
        uint tokenId = kingdoms.mint(_to, kingdomName);
        kingdoms.setTokenURI(tokenId, uri);
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

    /// Claim rewards and Mint token for player
    function ClaimKingdomReward(uint256 tokenId) external {
        uint256 lastClaimTime = kingdoms.getLastClaimTime(tokenId);
        require(block.timestamp > lastClaimTime, "can't claim reward before claim time");
        uint256 timePassed = block.timestamp - lastClaimTime;
        uint256 buildingLv = kingdoms.getBuildingLevel(tokenId,  KingdomNFT.Building.TownCenter);
        uint256 reward = calculateTownIncome(buildingLv, timePassed);

        // State save
        kingdoms.setClaimTime(tokenId, block.timestamp);
        token.mint(kingdoms.getRuler(tokenId), reward);
    }

    function UpgradeKingdomBuilding(uint256 tokenId, uint256 buildingId) external {
        require(kingdoms.getRuler(tokenId) == _msgSender(), "not ruler of kingdom");
        uint256 nextLv = kingdoms.getBuildingLevel(tokenId, KingdomNFT.Building(buildingId)) + 1;
        uint256 cost = getBuildingCost(buildingId, nextLv);

        token.burn(_msgSender(), cost);

        kingdoms.setBuildingLevel(tokenId, buildingId, nextLv);
    }

    function BurnKingdom(uint256 tokenId) external {}

    function AttackKingdom(
        uint256 fromTokenId,
        uint256 targetTokenId,
        string calldata reason
    ) external {}
}



// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// Store data for game logic
contract GameConfig {
    // Game Config
    uint256 public mintKingdomPenalty = 1 days;
    uint256 public mintKingdomPenaltyMultiplier = 2;

    // Income and building cost will be fixed for now
    // Calculated through excel formular and store it onchain.

    mapping(uint256 => uint256[256]) public buildingCosts;
    uint256[256] towncenterIncomePerSecond;

    /// GetPlayerReward based on time passed
    function getPlayerRewards(uint256 buildingLevel, uint256 timePassed) public view returns (uint256) {
        return timePassed * towncenterIncomePerSecond[buildingLevel];
    }

    function getBuildingCost(uint256 buildingId, uint256 buildingLevel) public view returns (uint256) {
        return buildingCosts[buildingId][buildingLevel];
    }
}

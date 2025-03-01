// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockSilo {
    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public stakingBoost;

    function setStakingBoost(address user, uint256 boost) external {
        stakingBoost[user] = boost;
    }

    function getStakingBoost(address user) external view returns (uint256) {
        return stakingBoost[user] > 0 ? stakingBoost[user] : 100; // Default to 1x (100%)
    }

    function updateStakingInfo(address user, uint256 amount, uint256 boost) external {
        stakedAmount[user] = amount;
        stakingBoost[user] = boost;
    }

    function getStakingInfo(address user) external view returns (uint256, uint256) {
        return (stakedAmount[user], stakingBoost[user]);
    }
}
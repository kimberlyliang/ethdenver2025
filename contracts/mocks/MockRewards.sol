// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockRewards {
    event RewardsDistributed(address indexed developer, address indexed dataProvider, uint256 amount);

    function distributeRewards(address developer, address dataProvider, uint256 amount) external {
        emit RewardsDistributed(developer, dataProvider, amount);
    }
}
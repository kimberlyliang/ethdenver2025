// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockRewards {
    event RewardsDistributed(address developer, address dataProvider, uint256 baseReward);

    function distributeRewards(address developer, address dataProvider, uint256 baseReward) external {
        emit RewardsDistributed(developer, dataProvider, baseReward);
    }
}

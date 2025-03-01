// contracts/MockSilo.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ISilo {
    function boostReward(uint256 amount) external returns (uint256);
}

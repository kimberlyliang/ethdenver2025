// contracts/Silo.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ISilo.sol"; // Import the ISilo interface

contract Silo is ISilo {
    function boostReward(uint256 amount) external pure override returns (uint256) {
        return amount; // Return the amount as is
    }
}

// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.20;

interface ISiloConfig {
    function updateYieldRate(address user, uint256 newYield) external;
    function getYieldRate(address user) external view returns (uint256);
}

contract MockSiloConfig is ISiloConfig {
    mapping(address => uint256) private yields;
    
    function updateYieldRate(address user, uint256 newYield) external override {
        yields[user] = newYield;
    }
    
    function getYieldRate(address user) external view override returns (uint256) {
        return yields[user];
    }
}

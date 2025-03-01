// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IHookReceiver {
    function beforeDeposit(bytes calldata data) external;
    function afterAction(bytes calldata data) external;
}

interface ISiloConfig {
    function updateYieldRate(address user, uint256 newYield) external;
}

abstract contract BaseHookReceiver is IHookReceiver {
    modifier onlyHookReceiver() {
        _;
    }
}

contract GaugeHookReceiver {
}

contract PartialLiquidation {
}

interface IRoiProof {
    function getAIModelPerformance(uint256 tokenId) external view returns (uint256);
}

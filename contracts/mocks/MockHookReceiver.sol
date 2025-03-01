// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.20;

interface IHookReceiver {
    function beforeDeposit(bytes calldata data) external;
    function afterAction(bytes calldata data) external;
}

abstract contract BaseHookReceiver is IHookReceiver {
    modifier onlyHookReceiver() {
        // In production this would verify msg.sender is authorized
        _;
    }
}

contract GaugeHookReceiver {
    // In production this would implement gauge-specific logic
}

contract PartialLiquidation {
    // In production this would implement liquidation logic
}

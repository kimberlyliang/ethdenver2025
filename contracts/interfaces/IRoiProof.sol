// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.20;

interface IRoiProof {
    function getAIModelPerformance(uint256 tokenId) external view returns (uint256);
}

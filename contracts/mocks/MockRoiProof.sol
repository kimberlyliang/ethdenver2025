// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IRoiProof} from "./MockSiloInterfaces.sol";

contract MockRoiProof is IRoiProof {
    mapping(uint256 => uint256) private performances;

    function setPerformance(uint256 tokenId, uint256 score) external {
        performances[tokenId] = score;
    }

    function getAIModelPerformance(uint256 tokenId) external view override returns (uint256) {
        return performances[tokenId];
    }
}

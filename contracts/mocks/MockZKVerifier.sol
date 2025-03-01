// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockZKVerifier {
    bool public willVerify = true;

    function setWillVerify(bool _willVerify) external {
        willVerify = _willVerify;
    }

    function verifyProof(bytes calldata, uint256) external view returns (bool) {
        return willVerify;
    }
}

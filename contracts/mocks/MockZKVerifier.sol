// contracts/mocks/MockZKVerifier.sol
pragma solidity ^0.8.0;

contract MockZKVerifier {
    bool private willVerify;

    function setWillVerify(bool _willVerify) external {
        willVerify = _willVerify;
    }

    function verify(bytes32 proof) external view returns (bool) {
        return willVerify;
    }
}
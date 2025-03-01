// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockStoryIntegration {
    event DatasetRegistered(address owner, uint256 tokenId, address ipId, uint256 licenseTermsId);

    function registerDataset(address datasetNFT, uint256 tokenId) external returns (address ipId, uint256 licenseTermsId) {
        // Mock IP ID and license terms ID
        ipId = address(uint160(uint256(keccak256(abi.encodePacked(datasetNFT, tokenId)))));
        licenseTermsId = uint256(keccak256(abi.encodePacked(datasetNFT, tokenId, "license")));

        emit DatasetRegistered(msg.sender, tokenId, ipId, licenseTermsId);
        return (ipId, licenseTermsId);
    }
}

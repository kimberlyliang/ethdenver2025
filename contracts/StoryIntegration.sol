// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract StoryIntegration is Ownable {
    constructor() Ownable(msg.sender) {}
    event DatasetRegistered(address indexed owner, uint256 tokenId, address ipId, uint256 licenseTermsId);
    
    // Mock function that returns deterministic values based on inputs
    function registerDataset(address datasetNFT, uint256 tokenId) external returns (address ipId, uint256 licenseTermsId) {
        require(IERC721(datasetNFT).ownerOf(tokenId) == msg.sender, "You must own the dataset NFT");

        // Generate deterministic mock values
        ipId = address(uint160(uint256(keccak256(abi.encodePacked(datasetNFT, tokenId)))));
        licenseTermsId = uint256(keccak256(abi.encodePacked(datasetNFT, tokenId, "license")));

        emit DatasetRegistered(msg.sender, tokenId, ipId, licenseTermsId);
        return (ipId, licenseTermsId);
    }
}

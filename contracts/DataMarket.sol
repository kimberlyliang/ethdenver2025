// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./StoryIntegration.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DataMarket is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    StoryIntegration public storyIntegration;

    struct Dataset {
        string metadata;
        uint256 tokenId;
        address uploader;
        address ipId;  // Story Protocol IP Asset ID
        uint256 licenseTermsId; // Licensing terms for dataset usage
    }

    mapping(uint256 => Dataset) public datasets;

    event DatasetUploaded(uint256 indexed tokenId, address indexed uploader, string metadata, address ipId);

    constructor(address _storyIntegration) ERC721("DataSwarm Dataset", "DSDATA") Ownable(msg.sender) {
        storyIntegration = StoryIntegration(_storyIntegration);
    }

    /// @notice Uploads dataset, mints NFT, registers it as IP Asset
    function uploadDataset(string memory metadata) external returns (uint256, address, uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;

        // Mint dataset NFT
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadata);

        // Register dataset on Story Protocol
        (address ipId, uint256 licenseTermsId) = storyIntegration.registerDataset(address(this), tokenId);

        // Store dataset details
        datasets[tokenId] = Dataset(metadata, tokenId, msg.sender, ipId, licenseTermsId);

        emit DatasetUploaded(tokenId, msg.sender, metadata, ipId);
        return (tokenId, ipId, licenseTermsId);
    }
}

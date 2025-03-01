// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.20;

import {IHookReceiver, BaseHookReceiver, GaugeHookReceiver, PartialLiquidation} from "./mocks/MockHookReceiver.sol";
import {ISiloConfig} from "./mocks/MockSiloConfig.sol";
import {IRoiProof} from "./interfaces/IRoiProof.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DatasetNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    mapping(uint256 => address) public datasetOwners;

    constructor() ERC721("DatasetNFT", "DNFT") Ownable(msg.sender) {}

    function mintDatasetNFT(address owner, string memory metadataURI) external onlyOwner returns (uint256) {
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        _mint(owner, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        datasetOwners[newTokenId] = owner;
        return newTokenId;
    }
}

contract DatasetSiloHook is BaseHookReceiver, GaugeHookReceiver, PartialLiquidation, Ownable {
    DatasetNFT public datasetNFT;
    ISiloConfig public siloConfig;
    IRoiProof public roiProof;

    mapping(uint256 => bool) public isNFTDeposited;
    mapping(uint256 => uint256) public aiPerformanceScores;

    event NFTDeposited(uint256 tokenId, address indexed owner);
    event YieldAdjusted(uint256 tokenId, uint256 newYieldRate);

    constructor(address _datasetNFT, address _siloConfig, address _roiProof) Ownable(msg.sender) {
        datasetNFT = DatasetNFT(_datasetNFT);
        siloConfig = ISiloConfig(_siloConfig);
        roiProof = IRoiProof(_roiProof);
    }

    function beforeDeposit(bytes calldata data) external override onlyHookReceiver {
        (uint256 tokenId) = abi.decode(data, (uint256));
        require(datasetNFT.ownerOf(tokenId) == msg.sender, "Not the NFT owner");
        require(!isNFTDeposited[tokenId], "Already deposited");
        isNFTDeposited[tokenId] = true;
        emit NFTDeposited(tokenId, msg.sender);
    }

    function afterAction(bytes calldata data) external override onlyHookReceiver {
        (uint256 tokenId) = abi.decode(data, (uint256));
        require(isNFTDeposited[tokenId], "NFT not deposited");
        uint256 aiScore = roiProof.getAIModelPerformance(tokenId);
        aiPerformanceScores[tokenId] = aiScore;
        uint256 newYield = calculateYield(aiScore);
        siloConfig.updateYieldRate(msg.sender, newYield);
        emit YieldAdjusted(tokenId, newYield);
    }

    function calculateYield(uint256 aiScore) public pure returns (uint256) {
        return aiScore > 5 ? 10 : 5;
    }
}

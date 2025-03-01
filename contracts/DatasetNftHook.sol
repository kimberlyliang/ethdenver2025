// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IHookReceiver} from "silo-contracts-v2/silo-core/contracts/interfaces/IHookReceiver.sol";
import {ISiloConfig} from "silo-contracts-v2/silo-core/contracts/interfaces/ISiloConfig.sol";
import {BaseHookReceiver} from "silo-contracts-v2/silo-core/contracts/utils/hook-receivers/_common/BaseHookReceiver.sol";
import {GaugeHookReceiver} from "silo-contracts-v2/silo-core/contracts/utils/hook-receivers/gauge/GaugeHookReceiver.sol";
import {PartialLiquidation} from "silo-contracts-v2/silo-core/contracts/utils/hook-receivers/liquidation/PartialLiquidation.sol";
import {ERC721URIStorage} from "@openzeppelin/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/access/Ownable.sol";
import "./RoiProof.circom";

contract DatasetNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    mapping(uint256 => address) public datasetOwners;

    constructor() ERC721("DatasetNFT", "DNFT") {}

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
    RoiProof public roiProof;

    mapping(uint256 => bool) public isNFTDeposited;
    mapping(uint256 => uint256) public aiPerformanceScores;

    event NFTDeposited(uint256 tokenId, address indexed owner);
    event YieldAdjusted(uint256 tokenId, uint256 newYieldRate);

    constructor(address _datasetNFT, address _siloConfig, address _roiProof) {
        datasetNFT = DatasetNFT(_datasetNFT);
        siloConfig = ISiloConfig(_siloConfig);
        roiProof = RoiProof(_roiProof);
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

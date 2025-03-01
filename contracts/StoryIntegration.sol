// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { IIPAssetRegistry } from "@storyprotocol/core/interfaces/registries/IIPAssetRegistry.sol";
import { ILicensingModule } from "@storyprotocol/core/interfaces/modules/licensing/ILicensingModule.sol";
import { IPILicenseTemplate } from "@storyprotocol/core/interfaces/modules/licensing/IPILicenseTemplate.sol";
import { PILFlavors } from "@storyprotocol/core/lib/PILFlavors.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract StoryIntegration is Ownable {
    IIPAssetRegistry public immutable IP_ASSET_REGISTRY;
    ILicensingModule public immutable LICENSING_MODULE;
    IPILicenseTemplate public immutable PIL_TEMPLATE;
    address public immutable ROYALTY_POLICY_LAP;
    address public immutable DATA_TOKEN; // Reward token for datasets

    event DatasetRegistered(address indexed owner, uint256 tokenId, address ipId, uint256 licenseTermsId);
    event LicenseMinted(address indexed licenseOwner, uint256 licenseTokenId);
    event AIModelRegistered(address indexed developer, address aiIpId, address parentIpId);

    constructor(
        address ipAssetRegistry,
        address licensingModule,
        address pilTemplate,
        address royaltyPolicyLAP,
        address dataToken
    ) {
        IP_ASSET_REGISTRY = IIPAssetRegistry(ipAssetRegistry);
        LICENSING_MODULE = ILicensingModule(licensingModule);
        PIL_TEMPLATE = IPILicenseTemplate(pilTemplate);
        ROYALTY_POLICY_LAP = royaltyPolicyLAP;
        DATA_TOKEN = dataToken;
    }

    /// @notice Registers a dataset as an IP Asset and attaches license terms.
    /// @param datasetNFT The address of the dataset NFT contract.
    /// @param tokenId The ID of the NFT representing the dataset.
    function registerDataset(address datasetNFT, uint256 tokenId) external returns (address ipId, uint256 licenseTermsId) {
        require(IERC721(datasetNFT).ownerOf(tokenId) == msg.sender, "You must own the dataset NFT");

        // Register dataset as IP Asset on Story Protocol
        ipId = IP_ASSET_REGISTRY.register(block.chainid, datasetNFT, tokenId);

        // Register dataset licensing terms
        licenseTermsId = PIL_TEMPLATE.registerLicenseTerms(
            PILFlavors.commercialRemix({
                mintingFee: 0,
                commercialRevShare: 10 * 10 ** 6, // 10% revenue share
                royaltyPolicy: ROYALTY_POLICY_LAP,
                currencyToken: DATA_TOKEN
            })
        );

        // Attach license terms to dataset
        LICENSING_MODULE.attachLicenseTerms(ipId, address(PIL_TEMPLATE), licenseTermsId);

        emit DatasetRegistered(msg.sender, tokenId, ipId, licenseTermsId);
    }

    /// @notice Mints a license token for using a dataset.
    /// @param parentIpId The dataset's IP Asset ID.
    /// @param licenseTermsId The ID of the license terms.
    function mintDatasetLicense(address parentIpId, uint256 licenseTermsId) external returns (uint256 licenseTokenId) {
        licenseTokenId = LICENSING_MODULE.mintLicenseTokens({
            licensorIpId: parentIpId,
            licenseTemplate: address(PIL_TEMPLATE),
            licenseTermsId: licenseTermsId,
            amount: 1,
            receiver: msg.sender,
            royaltyContext: "",
            maxMintingFee: 0,
            maxRevenueShare: 0
        });

        emit LicenseMinted(msg.sender, licenseTokenId);
    }

    /// @notice Registers an AI model as a derivative of a dataset.
    /// @param aiModelNFT The address of the AI model NFT contract.
    /// @param tokenId The AI model's NFT ID.
    /// @param parentIpId The dataset's IP Asset ID.
    /// @param licenseTokenId The license token proving dataset usage.
    function registerAIModel(
        address aiModelNFT,
        uint256 tokenId,
        address parentIpId,
        uint256 licenseTokenId
    ) external returns (address aiIpId) {
        require(IERC721(aiModelNFT).ownerOf(tokenId) == msg.sender, "You must own the AI model NFT");

        // Register AI model as an IP Asset
        aiIpId = IP_ASSET_REGISTRY.register(block.chainid, aiModelNFT, tokenId);

        uint256;
        licenseTokenIds[0] = licenseTokenId;

        // Link AI model as derivative of dataset
        LICENSING_MODULE.registerDerivativeWithLicenseTokens({
            childIpId: aiIpId,
            licenseTokenIds: licenseTokenIds,
            royaltyContext: "",
            maxRts: 0
        });

        emit AIModelRegistered(msg.sender, aiIpId, parentIpId);
    }
}
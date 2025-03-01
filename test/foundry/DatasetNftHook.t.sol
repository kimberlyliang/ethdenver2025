// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {DatasetNFT, DatasetSiloHook} from "../../contracts/DatasetNftHook.sol";
import {IRoiProof} from "../../contracts/interfaces/IRoiProof.sol";
import {MockRoiProof} from "../../contracts/mocks/MockRoiProof.sol";
import {MockSiloConfig} from "../../contracts/mocks/MockSiloConfig.sol";

contract DatasetNftHookTest is Test {
    DatasetNFT public nft;
    DatasetSiloHook public hook;
    MockRoiProof public roiProof;
    MockSiloConfig public siloConfig;
    
    address alice = address(0x1);
    
    function setUp() public {
        nft = new DatasetNFT();
        roiProof = new MockRoiProof();
        siloConfig = new MockSiloConfig();
        hook = new DatasetSiloHook(
            address(nft),
            address(siloConfig),
            address(roiProof)
        );
        
        // First mint the NFT to alice
        vm.startPrank(address(this));
        nft.mintDatasetNFT(alice, "ipfs://init");
        vm.stopPrank();

        // Then give NFT contract role to hook
        nft.transferOwnership(address(hook));
    }
    
    function testDeposit() public {
        uint256 tokenId = 1; // First token ID
        vm.startPrank(alice);
        
        // Encode token ID for deposit
        bytes memory data = abi.encode(tokenId);
        
        // Deposit should succeed
        hook.beforeDeposit(data);
        assertTrue(hook.isNFTDeposited(tokenId));
        vm.stopPrank();
    }
    
    function testAdjustYield() public {
        uint256 tokenId = 1; // First token ID
        vm.startPrank(alice);
        bytes memory data = abi.encode(tokenId);
        hook.beforeDeposit(data);
        
        // Set ROI score to 8 (above threshold)
        roiProof.setPerformance(tokenId, 8);
        
        // Action should adjust yield
        hook.afterAction(data);
        assertEq(siloConfig.getYieldRate(alice), 10); // High score = 10% yield
        
        // Set ROI score to 3 (below threshold) 
        roiProof.setPerformance(tokenId, 3);
        
        // Action should lower yield
        hook.afterAction(data);
        assertEq(siloConfig.getYieldRate(alice), 5); // Low score = 5% yield
        vm.stopPrank();
    }
    
    function test_RevertWhen_NotOwner() public {
        uint256 tokenId = 1; // First token ID
        bytes memory data = abi.encode(tokenId);
        
        vm.prank(address(0x2));
        vm.expectRevert("Not the NFT owner");
        hook.beforeDeposit(data);
    }
    
    function test_RevertWhen_DoubleDeposit() public {
        vm.startPrank(alice);
        uint256 tokenId = 1; // First token ID
        bytes memory data = abi.encode(tokenId);
        
        // First deposit succeeds
        hook.beforeDeposit(data);
        
        // Second deposit fails
        vm.expectRevert("Already deposited");
        hook.beforeDeposit(data);
        vm.stopPrank();
    }
}

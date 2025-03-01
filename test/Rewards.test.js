const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Rewards", function () {
    let Rewards, rewards, silo;
    let owner, developer, dataProvider;
    const DEVELOPER_SHARE = 70;
    const DATA_PROVIDER_SHARE = 30;

    beforeEach(async function () {
        [owner, developer, dataProvider] = await ethers.getSigners();

        // Deploy mock Silo
        const MockSilo = await ethers.getContractFactory("MockSilo");
        silo = await MockSilo.deploy();

        // Deploy Rewards with mock Silo
        Rewards = await ethers.getContractFactory("Rewards");
        rewards = await Rewards.deploy(silo.target);
    });

    describe("Token Management", function () {
        it("should initialize with correct name and symbol", async function () {
            expect(await rewards.name()).to.equal("DSWARM");
            expect(await rewards.symbol()).to.equal("DSWM");
        });

        it("should set correct initial supply", async function () {
            const totalSupply = await rewards.totalSupply();
            expect(totalSupply).to.equal(0n); // Initially zero
        });

        it("should allow only owner to mint tokens", async function () {
            const amount = ethers.parseEther("1000");

            await expect(rewards.connect(developer).mint(developer.address, amount))
                .to.be.revertedWithCustomError(rewards, "OwnableUnauthorizedAccount");

            await expect(rewards.mint(developer.address, amount))
                .to.emit(rewards, "Transfer")
                .withArgs(ethers.ZeroAddress, developer.address, amount);

            expect(await rewards.balanceOf(developer.address)).to.equal(amount);
        });
    });

    describe("Reward Distribution", function () {
        const rewardAmount = ethers.parseEther("1000");

        beforeEach(async function () {
            // Mint initial tokens to rewards contract
            await rewards.mint(rewards.target, rewardAmount * 10n);
        });

        it("should distribute rewards with correct split", async function () {
            // Add the contract itself as authorized contract for testing
            await rewards.addAuthorizedContract(owner.address);
            
            await expect(rewards.distributeRewards(developer.address, dataProvider.address, rewardAmount))
                .to.emit(rewards, "RewardsDistributed")
                .withArgs(developer.address, dataProvider.address, rewardAmount);

            const developerReward = (rewardAmount * BigInt(DEVELOPER_SHARE)) / 100n;
            const dataProviderReward = (rewardAmount * BigInt(DATA_PROVIDER_SHARE)) / 100n;

            expect(await rewards.balanceOf(developer.address)).to.equal(developerReward);
            expect(await rewards.balanceOf(dataProvider.address)).to.equal(dataProviderReward);
        });

        it("should boost rewards based on Silo staking", async function () {
            // Add the contract itself as authorized contract for testing
            await rewards.addAuthorizedContract(owner.address);
            
            // Set staking boost in mock
            await silo.setStakingBoost(developer.address, 150); // 1.5x boost
            
            await rewards.distributeRewards(developer.address, dataProvider.address, rewardAmount);

            const developerReward = (rewardAmount * BigInt(DEVELOPER_SHARE)) / 100n;
            const boostedDeveloperReward = (developerReward * 150n) / 100n;

            expect(await rewards.balanceOf(developer.address)).to.equal(boostedDeveloperReward);
        });

        it("should cap boost at maximum value", async function () {
            // Add the contract itself as authorized contract for testing
            await rewards.addAuthorizedContract(owner.address);
            
            // Set very high staking boost in mock
            await silo.setStakingBoost(developer.address, 1000); // 10x boost (should be capped)
            
            await rewards.distributeRewards(developer.address, dataProvider.address, rewardAmount);

            const developerReward = (rewardAmount * BigInt(DEVELOPER_SHARE)) / 100n;
            const maxBoostedReward = (developerReward * 200n) / 100n; // Max 2x boost

            expect(await rewards.balanceOf(developer.address)).to.equal(maxBoostedReward);
        });

        it("should revert if insufficient rewards balance", async function () {
            // Add the contract itself as authorized contract for testing
            await rewards.addAuthorizedContract(owner.address);
            
            const tooMuch = ethers.parseEther("1000000");
            
            await expect(rewards.distributeRewards(
                developer.address,
                dataProvider.address,
                tooMuch
            )).to.be.revertedWithCustomError(rewards, "InsufficientRewardsBalance");
        });
    });

    describe("Staking Integration", function () {
        it("should update staking info from Silo", async function () {
            // Simulate staking update in Silo
            await silo.updateStakingInfo(
                developer.address,
                ethers.parseEther("1000"),
                180  // 1.8x boost
            );

            const stakingInfo = await rewards.getStakingInfo(developer.address);
            expect(stakingInfo[0]).to.equal(ethers.parseEther("1000"));
            expect(stakingInfo[1]).to.equal(180n);
        });

        it("should calculate correct boosted rewards", async function () {
            const baseAmount = ethers.parseEther("1000");
            await silo.setStakingBoost(developer.address, 150); // 1.5x boost

            const boostedAmount = await rewards.calculateBoostedReward(
                developer.address,
                baseAmount
            );

            expect(boostedAmount).to.equal((baseAmount * 150n) / 100n);
        });
    });

    describe("Access Control", function () {
        it("should only allow authorized contracts to distribute rewards", async function () {
            await expect(rewards.connect(developer).distributeRewards(
                developer.address,
                dataProvider.address,
                ethers.parseEther("1000")
            )).to.be.revertedWithCustomError(rewards, "UnauthorizedCaller");
        });

        it("should allow owner to add authorized contracts", async function () {
            const newContract = ethers.getAddress(ethers.hexlify(ethers.randomBytes(20)));

            await expect(rewards.addAuthorizedContract(newContract))
                .to.emit(rewards, "ContractAuthorized")
                .withArgs(newContract);

            expect(await rewards.isAuthorizedContract(newContract)).to.be.true;
        });

        it("should allow owner to remove authorized contracts", async function () {
            const newContract = ethers.getAddress(ethers.hexlify(ethers.randomBytes(20)));
            await rewards.addAuthorizedContract(newContract);

            await expect(rewards.removeAuthorizedContract(newContract))
                .to.emit(rewards, "ContractUnauthorized")
                .withArgs(newContract);

            expect(await rewards.isAuthorizedContract(newContract)).to.be.false;
        });
    });
});
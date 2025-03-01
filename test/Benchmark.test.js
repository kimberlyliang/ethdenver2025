const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Benchmark", function () {
    let Benchmark, benchmark, zkVerifier, rewardsContract;

    beforeEach(async function () {
        // Deploy mock contracts
        const MockZKVerifier = await ethers.getContractFactory("MockZKVerifier");
        zkVerifier = await MockZKVerifier.deploy();
        await zkVerifier.deployed();

        const MockRewards = await ethers.getContractFactory("MockRewards");
        rewardsContract = await MockRewards.deploy();
        await rewardsContract.deployed();

        // Deploy Benchmark with mocks
        Benchmark = await ethers.getContractFactory("Benchmark");
        benchmark = await Benchmark.deploy(zkVerifier.address, rewardsContract.address);
        await benchmark.deployed();
    });

    describe("Verification and Rewards", function () {
        it("should verify proof and distribute rewards when verification succeeds", async function () {
            const proof = ethers.utils.formatBytes32String("test-proof");
            const roi = 10;
            const agent = ethers.Wallet.createRandom().address;
            const dataProvider = ethers.Wallet.createRandom().address;

            await zkVerifier.setWillVerify(true);

            await expect(benchmark.verifyAndReward(proof, roi, agent, dataProvider))
                .to.emit(benchmark, "ProofVerified")
                .withArgs(agent, roi, true)
                .and.to.emit(rewardsContract, "RewardsDistributed")
                .withArgs(agent, dataProvider, ethers.utils.parseEther("100"));
        });

        it("should not distribute rewards when verification fails", async function () {
            const proof = ethers.utils.formatBytes32String("test-proof");
            const roi = 10;
            const agent = ethers.Wallet.createRandom().address;
            const dataProvider = ethers.Wallet.createRandom().address;

            await zkVerifier.setWillVerify(false);

            await expect(benchmark.verifyAndReward(proof, roi, agent, dataProvider))
                .to.emit(benchmark, "ProofVerified")
                .withArgs(agent, roi, false)
                .and.not.to.emit(rewardsContract, "RewardsDistributed");
        });
    });
});

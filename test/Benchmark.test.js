const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Benchmark", function () {
    let Benchmark, benchmark, zkVerifier, rewardsContract;

    beforeEach(async function () {
        const ZKVerifier = await ethers.getContractFactory("IZKVerifier");
        zkVerifier = await ZKVerifier.deploy();
        await zkVerifier.deployed();

        const Rewards = await ethers.getContractFactory("Rewards");
        rewardsContract = await Rewards.deploy(zkVerifier.address, ethers.constants.AddressZero);
        await rewardsContract.deployed();

        Benchmark = await ethers.getContractFactory("Benchmark");
        benchmark = await Benchmark.deploy(zkVerifier.address, rewardsContract.address);
        await benchmark.deployed();
    });

    it("should verify proof and distribute rewards", async function () {
        const proof = "0x123"; // Example proof
        const roi = 10;
        const agent = ethers.Wallet.createRandom().address;
        const dataProvider = ethers.Wallet.createRandom().address;

        await expect(benchmark.verifyAndReward(proof, roi, agent, dataProvider))
            .to.emit(benchmark, "ProofVerified")
            .withArgs(agent, roi, true);
    });
});

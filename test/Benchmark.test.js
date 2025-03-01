const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Benchmark", function () {
    let Benchmark, benchmark, zkVerifier, rewardsContract;

    beforeEach(async function () {
        // Deploy mock contracts
        const MockZKVerifier = await ethers.getContractFactory("MockZKVerifier");
        zkVerifier = await MockZKVerifier.deploy();
        
        const MockRewards = await ethers.getContractFactory("MockRewards");
        rewardsContract = await MockRewards.deploy();
        
        // Deploy Benchmark with mocks
        Benchmark = await ethers.getContractFactory("Benchmark");
        benchmark = await Benchmark.deploy(zkVerifier.target, rewardsContract.target);
    });

    describe("Verification and Rewards", function () {
        it("should verify proof and distribute rewards when verification succeeds", async function () {
            const proof = ethers.keccak256(ethers.toUtf8Bytes("test-proof"));
            const roi = 10;
            const agent = ethers.getAddress(ethers.hexlify(ethers.randomBytes(20)));
            const dataProvider = ethers.getAddress(ethers.hexlify(ethers.randomBytes(20)));

            await zkVerifier.setWillVerify(true);

            await expect(benchmark.verifyAndReward(proof, roi, agent, dataProvider))
                .to.emit(benchmark, "ProofVerified")
                .withArgs(agent, roi, true)
                .to.emit(rewardsContract, "RewardsDistributed");
        });

        it("should not distribute rewards when verification fails", async function () {
            const proof = ethers.keccak256(ethers.toUtf8Bytes("test-proof"));
            const roi = 10;
            const agent = ethers.getAddress(ethers.hexlify(ethers.randomBytes(20)));
            const dataProvider = ethers.getAddress(ethers.hexlify(ethers.randomBytes(20)));

            await zkVerifier.setWillVerify(false);

            await expect(benchmark.verifyAndReward(proof, roi, agent, dataProvider))
                .to.emit(benchmark, "ProofVerified")
                .withArgs(agent, roi, false);
                
            // Check that rewards were not distributed by looking for events
            const txResponse = await benchmark.verifyAndReward(proof, roi, agent, dataProvider);
            const txReceipt = await txResponse.wait();
            
            const rewardEvents = txReceipt.logs
                .filter(log => log.address === rewardsContract.target)
                .map(log => {
                    try {
                        return rewardsContract.interface.parseLog({
                            topics: log.topics,
                            data: log.data
                        });
                    } catch (e) {
                        return null;
                    }
                })
                .filter(parsed => parsed && parsed.name === "RewardsDistributed");
                
            expect(rewardEvents.length).to.equal(0);
        });
    });
});
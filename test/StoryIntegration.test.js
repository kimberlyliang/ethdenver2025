const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StoryIntegration", function () {
    let StoryIntegration, storyIntegration;
    let owner, dataProvider;

    beforeEach(async function () {
        [owner, dataProvider] = await ethers.getSigners();

        StoryIntegration = await ethers.getContractFactory("StoryIntegration");
        storyIntegration = await StoryIntegration.deploy();
    });

    describe("Dataset Registration", function () {
        it("should generate deterministic IP ID", async function () {
            const nftContract = ethers.Wallet.createRandom().address;
            const tokenId = 1;
            
            const tx = await storyIntegration.registerDataset(nftContract, tokenId);
            const receipt = await tx.wait();
            
            const event = receipt.logs
                .filter(log => log.address === storyIntegration.target)
                .map(log => {
                    try {
                        return storyIntegration.interface.parseLog({
                            topics: log.topics,
                            data: log.data
                        });
                    } catch (e) {
                        return null;
                    }
                })
                .find(parsed => parsed && parsed.name === "DatasetRegistered");

            expect(event).to.not.be.undefined;
            expect(event.args.ipId).to.not.equal(ethers.ZeroAddress);
            expect(event.args.tokenId).to.equal(tokenId);
        });

        it("should generate unique IP IDs for different datasets", async function () {
            const nftContract = ethers.Wallet.createRandom().address;
            
            const tx1 = await storyIntegration.registerDataset(nftContract, 1);
            const tx2 = await storyIntegration.registerDataset(nftContract, 2);
            
            const receipt1 = await tx1.wait();
            const receipt2 = await tx2.wait();
            
            const event1 = receipt1.logs
                .filter(log => log.address === storyIntegration.target)
                .map(log => storyIntegration.interface.parseLog({
                    topics: log.topics,
                    data: log.data
                }))
                .find(parsed => parsed.name === "DatasetRegistered");
                
            const event2 = receipt2.logs
                .filter(log => log.address === storyIntegration.target)
                .map(log => storyIntegration.interface.parseLog({
                    topics: log.topics,
                    data: log.data
                }))
                .find(parsed => parsed.name === "DatasetRegistered");
            
            expect(event1.args.ipId).to.not.equal(event2.args.ipId);
        });
    });
});
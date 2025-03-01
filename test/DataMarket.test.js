const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DataMarket", function () {
    let DataMarket, dataMarket, storyIntegration;
    let owner, user;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        // Deploy mock StoryIntegration
        const MockStoryIntegration = await ethers.getContractFactory("MockStoryIntegration");
        storyIntegration = await MockStoryIntegration.deploy();
        await storyIntegration.deployed();

        // Deploy DataMarket with mock
        DataMarket = await ethers.getContractFactory("DataMarket");
        dataMarket = await DataMarket.deploy(storyIntegration.address);
        await dataMarket.deployed();
    });

    describe("Dataset Operations", function () {
        it("should upload dataset and mint NFT", async function () {
            const metadata = "ipfs://QmExample";
            
            await expect(dataMarket.connect(user).uploadDataset(metadata))
                .to.emit(dataMarket, "DatasetUploaded")
                .and.to.emit(storyIntegration, "DatasetRegistered");

            const dataset = await dataMarket.datasets(0);
            expect(dataset.metadata).to.equal(metadata);
            expect(dataset.uploader).to.equal(user.address);
            expect(await dataMarket.ownerOf(0)).to.equal(user.address);
        });

        it("should store Story Protocol registration details", async function () {
            const metadata = "ipfs://QmExample";
            
            const tx = await dataMarket.connect(user).uploadDataset(metadata);
            const receipt = await tx.wait();
            
            const uploadEvent = receipt.events?.find(e => e.event === "DatasetUploaded");
            expect(uploadEvent).to.not.be.undefined;
            
            const dataset = await dataMarket.datasets(0);
            expect(dataset.ipId).to.equal(uploadEvent.args.ipId);
            expect(dataset.licenseTermsId).to.not.equal(0);
        });
    });
});

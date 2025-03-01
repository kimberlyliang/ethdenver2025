const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DataMarket", function () {
    let DataMarket, dataMarket, ethStorage;

    beforeEach(async function () {
        const EthStorage = await ethers.getContractFactory("IEthStorage");
        ethStorage = await EthStorage.deploy();
        await ethStorage.deployed();

        DataMarket = await ethers.getContractFactory("DataMarket");
        dataMarket = await DataMarket.deploy(ethStorage.address);
        await dataMarket.deployed();
    });

    it("should upload data", async function () {
        const data = "0x123"; // Example data
        const metadata = "Sample metadata";

        await expect(dataMarket.uploadData(data, metadata))
            .to.emit(dataMarket, "DataUploaded");
    });

    it("should get data", async function () {
        const data = "0x123"; // Example data
        const metadata = "Sample metadata";

        await dataMarket.uploadData(data, metadata);
        const entry = await dataMarket.getData(0);

        expect(entry.metadata).to.equal(metadata);
    });
});

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainData", function () {
    let CrossChainData, crossChainData, chainlinkCCIP;

    beforeEach(async function () {
        const ChainlinkCCIP = await ethers.getContractFactory("IChainlinkCCIP");
        chainlinkCCIP = await ChainlinkCCIP.deploy();
        await chainlinkCCIP.deployed();

        CrossChainData = await ethers.getContractFactory("CrossChainData");
        crossChainData = await CrossChainData.deploy(chainlinkCCIP.address, ethers.constants.AddressZero);
        await crossChainData.deployed();
    });

    it("should fetch data", async function () {
        const requestParams = "0x123"; // Example request parameters

        await expect(crossChainData.fetchData(requestParams))
            .to.emit(crossChainData, "DataReceived");
    });
});

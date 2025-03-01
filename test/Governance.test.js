const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Governance", function () {
    let Governance, governance;

    beforeEach(async function () {
        Governance = await ethers.getContractFactory("Governance");
        governance = await Governance.deploy();
        await governance.deployed();
    });

    it("should return the correct metric", async function () {
        const metric = await governance.getMetric();
        expect(metric).to.equal("ROI > 5%");
    });
});

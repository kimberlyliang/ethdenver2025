const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Governance", function () {
    let Governance, governance;
    let owner, user;
    const DEFAULT_ROI_THRESHOLD = 5; // 5%

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        Governance = await ethers.getContractFactory("Governance");
        governance = await Governance.deploy();
    });

    describe("ROI Threshold Management", function () {
        it("should initialize with correct default ROI threshold", async function () {
            const threshold = await governance.getRoiThreshold();
            expect(threshold).to.equal(DEFAULT_ROI_THRESHOLD);
        });

        it("should allow owner to update ROI threshold", async function () {
            const newThreshold = 7; // 7%

            await expect(governance.setRoiThreshold(newThreshold))
                .to.emit(governance, "RoiThresholdUpdated")
                .withArgs(DEFAULT_ROI_THRESHOLD, newThreshold);

            expect(await governance.getRoiThreshold()).to.equal(newThreshold);
        });

        it("should revert when non-owner tries to update ROI threshold", async function () {
            await expect(governance.connect(user).setRoiThreshold(7))
                .to.be.revertedWithCustomError(governance, "OwnableUnauthorizedAccount");
        });

        it("should validate ROI threshold range", async function () {
            // Test minimum value
            await expect(governance.setRoiThreshold(0))
                .to.be.revertedWithCustomError(governance, "InvalidThreshold");

            // Test maximum value
            await expect(governance.setRoiThreshold(101))
                .to.be.revertedWithCustomError(governance, "InvalidThreshold");

            // Test valid values
            await expect(governance.setRoiThreshold(1)).to.not.be.reverted;
            await expect(governance.setRoiThreshold(100)).to.not.be.reverted;
        });
    });

    // Other tests updated similarly...
});
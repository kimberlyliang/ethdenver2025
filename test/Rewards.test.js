const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Rewards", function () {
    let Rewards, rewards, mockSilo;

    beforeEach(async function () {
        mockSilo = await (await ethers.getContractFactory("MockSilo")).deploy();  
        console.log(MockSilo); // Should not be undefined
        await mockSilo.deployed();

        Rewards = await ethers.getContractFactory("Rewards");
        rewards = await Rewards.deploy(mockSilo.address, ethers.constants.AddressZero);
        await rewards.deployed();
    });

    it("should distribute rewards", async function () {
        const developer = ethers.Wallet.createRandom().address;
        const dataProvider = ethers.Wallet.createRandom().address;

        await rewards.setAgentContract(developer); // Set the agent contract for testing

        await expect(rewards.distributeRewards(developer, dataProvider, 100))
            .to.emit(rewards, "RewardsDistributed")
            .withArgs(developer, dataProvider, 70, 30); // Assuming 70% to developer and 30% to provider
    });
});

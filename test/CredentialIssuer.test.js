const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredentialIssuer", function () {
    let CredentialIssuer, credentialIssuer;

    beforeEach(async function () {
        CredentialIssuer = await ethers.getContractFactory("CredentialIssuer");
        credentialIssuer = await CredentialIssuer.deploy();
        await credentialIssuer.deployed();
    });

    it("should issue a credential", async function () {
        const provider = ethers.Wallet.createRandom().address;
        const dataHash = "Qm..."; // Example data hash

        await expect(credentialIssuer.issueCredential(provider, dataHash))
            .to.emit(credentialIssuer, "CredentialIssued")
            .withArgs(provider, 1);
    });
});

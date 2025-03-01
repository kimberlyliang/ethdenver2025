// scripts/deploy.js
const hre = require("hardhat");

async function main() {
    // Deploy the Silo contract
    const Silo = await hre.ethers.getContractFactory("Silo");
    const silo = await Silo.deploy();
    await silo.deployed();
    console.log("Silo deployed to:", silo.address);

    // Deploy the Rewards contract with the address of the deployed Silo
    const Rewards = await hre.ethers.getContractFactory("Rewards");
    const rewards = await Rewards.deploy(silo.address, (await hre.ethers.getSigners())[0].address); // Use the first signer as the owner
    await rewards.deployed();
    console.log("Rewards deployed to:", rewards.address);
}

// Execute the main function and handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

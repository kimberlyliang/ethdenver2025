const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MockZKVerifier
  const MockZKVerifier = await hre.ethers.getContractFactory("MockZKVerifier");
  const mockZKVerifier = await MockZKVerifier.deploy();
  await mockZKVerifier.waitForDeployment();
  console.log("MockZKVerifier deployed to:", await mockZKVerifier.getAddress());

  // Deploy MockRewards
  const MockRewards = await hre.ethers.getContractFactory("MockRewards");
  const mockRewards = await MockRewards.deploy();
  await mockRewards.waitForDeployment();
  console.log("MockRewards deployed to:", await mockRewards.getAddress());

  // Deploy MockStoryIntegration
  const MockStoryIntegration = await hre.ethers.getContractFactory("MockStoryIntegration");
  const mockStoryIntegration = await MockStoryIntegration.deploy();
  await mockStoryIntegration.waitForDeployment();
  console.log("MockStoryIntegration deployed to:", await mockStoryIntegration.getAddress());

  // Deploy DataMarket with MockStoryIntegration
  const DataMarket = await hre.ethers.getContractFactory("DataMarket");
  const dataMarket = await DataMarket.deploy(await mockStoryIntegration.getAddress());
  await dataMarket.waitForDeployment();
  console.log("DataMarket deployed to:", await dataMarket.getAddress());

  // Deploy Benchmark with MockZKVerifier and MockRewards
  const Benchmark = await hre.ethers.getContractFactory("Benchmark");
  const benchmark = await Benchmark.deploy(
    await mockZKVerifier.getAddress(),
    await mockRewards.getAddress()
  );
  await benchmark.waitForDeployment();
  console.log("Benchmark deployed to:", await benchmark.getAddress());

  // Deploy CredentialIssuer
  const CredentialIssuer = await hre.ethers.getContractFactory("CredentialIssuer");
  const credentialIssuer = await CredentialIssuer.deploy();
  await credentialIssuer.waitForDeployment();
  console.log("CredentialIssuer deployed to:", await credentialIssuer.getAddress());

  // Deploy Governance
  const Governance = await hre.ethers.getContractFactory("Governance");
  const governance = await Governance.deploy();
  await governance.waitForDeployment();
  console.log("Governance deployed to:", await governance.getAddress());


  // Save the contract addresses to a file that the frontend can use
  const fs = require("fs");
  const contractAddresses = {
    MockZKVerifier: await mockZKVerifier.getAddress(),
    MockRewards: await mockRewards.getAddress(),
    MockStoryIntegration: await mockStoryIntegration.getAddress(),
    DataMarket: await dataMarket.getAddress(),
    Benchmark: await benchmark.getAddress(),
    CredentialIssuer: await credentialIssuer.getAddress(),
    Governance: await governance.getAddress(),
  };

  // Ensure the frontend artifacts directory exists
  const frontendDir = "./ignition/my-ml-competitions/src/artifacts";
  if (!fs.existsSync(frontendDir)){
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  fs.writeFileSync(
    `${frontendDir}/contracts.json`,
    JSON.stringify(contractAddresses, null, 2)
  );

  console.log("Contract addresses saved to frontend artifacts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

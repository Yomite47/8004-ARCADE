const hre = require("hardhat");

async function main() {
  // Get the deployer's address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Define the Game Agent address (using deployer for now, can be updated later)
  const gameAgent = deployer.address;
  console.log("Game Agent set to:", gameAgent);

  // Deploy the contract
  const Arcade8004 = await hre.ethers.getContractFactory("Arcade8004");
  const arcade = await Arcade8004.deploy(gameAgent);

  await arcade.waitForDeployment();
  const contractAddress = await arcade.getAddress();

  console.log("Arcade8004 deployed to:", contractAddress);

  // Set the Base URI (Metadata CID from Pinata)
  // CID: bafybeiedmhpgjvcvgplv4wbanhajpzrk4532n7rnvc6vtgijwfdmtw3h3a
  const baseURI = "ipfs://bafybeiedmhpgjvcvgplv4wbanhajpzrk4532n7rnvc6vtgijwfdmtw3h3a/";
  console.log("Setting Base URI to:", baseURI);
  
  const tx = await arcade.setBaseURI(baseURI);
  await tx.wait();
  
  console.log("Base URI set successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

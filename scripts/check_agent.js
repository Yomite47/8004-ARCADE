const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0x2AE8969DDDAf15e268792B4c361c45E20993ceC0";
  const Arcade8004 = await hre.ethers.getContractFactory("Arcade8004");
  const contract = Arcade8004.attach(CONTRACT_ADDRESS);

  const gameAgent = await contract.gameAgent();
  console.log("On-chain Game Agent Address:", gameAgent);

  // Check deployer address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Local Deployer Address:", deployer.address);

  if (gameAgent.toLowerCase() === deployer.address.toLowerCase()) {
      console.log("SUCCESS: On-chain agent matches local deployer.");
  } else {
      console.log("WARNING: On-chain agent DOES NOT match local deployer.");
      console.log("Ensure the PRIVATE_KEY in Vercel corresponds to:", gameAgent);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

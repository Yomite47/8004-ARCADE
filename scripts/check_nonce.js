
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const nonce = await hre.ethers.provider.getTransactionCount(deployer.address);
  console.log("Current Nonce:", nonce);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

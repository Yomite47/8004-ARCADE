require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x2AE8969DDDAf15e268792B4c361c45E20993ceC0";

  // Get network information to confirm where we are checking
  const network = await hre.ethers.provider.getNetwork();
  console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
  
  console.log(`Checking balance for contract at: ${contractAddress}`);
  
  const provider = hre.ethers.provider;
  const balance = await provider.getBalance(contractAddress);
  
  console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

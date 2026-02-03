const hre = require("hardhat");

async function main() {
  const contractAddress = "0x2AE8969DDDAf15e268792B4c361c45E20993ceC0";
  
  console.log(`Checking balance for contract at: ${contractAddress}`);
  
  const provider = hre.ethers.provider;
  const balance = await provider.getBalance(contractAddress);
  
  console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

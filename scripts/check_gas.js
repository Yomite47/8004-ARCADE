
const hre = require("hardhat");

async function main() {
  const provider = hre.ethers.provider;
  const feeData = await provider.getFeeData();
  
  console.log("Current Gas Data:");
  console.log("Gas Price:", feeData.gasPrice ? hre.ethers.formatUnits(feeData.gasPrice, "gwei") : "null");
  console.log("Max Fee Per Gas:", feeData.maxFeePerGas ? hre.ethers.formatUnits(feeData.maxFeePerGas, "gwei") : "null");
  console.log("Max Priority Fee Per Gas:", feeData.maxPriorityFeePerGas ? hre.ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei") : "null");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

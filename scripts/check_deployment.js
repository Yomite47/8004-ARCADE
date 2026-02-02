
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  // Calculate address for nonce 0
  const addressNonce0 = ethers.getCreateAddress({ from: deployer.address, nonce: 0 });
  const code0 = await ethers.provider.getCode(addressNonce0);
  console.log(`Nonce 0 Address: ${addressNonce0} | Code Length: ${code0.length}`);

  // Calculate address for nonce 1
  const addressNonce1 = ethers.getCreateAddress({ from: deployer.address, nonce: 1 });
  const code1 = await ethers.provider.getCode(addressNonce1);
  console.log(`Nonce 1 Address: ${addressNonce1} | Code Length: ${code1.length}`);
  
  // Calculate address for nonce 2 (Next one)
  const addressNonce2 = ethers.getCreateAddress({ from: deployer.address, nonce: 2 });
  const code2 = await ethers.provider.getCode(addressNonce2);
  console.log(`Nonce 2 Address: ${addressNonce2} | Code Length: ${code2.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

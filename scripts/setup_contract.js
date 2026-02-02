
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x2AE8969DDDAf15e268792B4c361c45E20993ceC0";
  const Arcade8004 = await hre.ethers.getContractFactory("Arcade8004");
  const arcade = Arcade8004.attach(contractAddress);

  const baseURI = await arcade.baseURI();
  console.log("Current Base URI:", baseURI);
  
  if (!baseURI) {
      console.log("Base URI is empty. Setting it now...");
      const uri = "ipfs://bafybeiedmhpgjvcvgplv4wbanhajpzrk4532n7rnvc6vtgijwfdmtw3h3a/";
      // Manual gas for safety
      const tx = await arcade.setBaseURI(uri, {
          maxFeePerGas: hre.ethers.parseUnits("10", "gwei"),
          maxPriorityFeePerGas: hre.ethers.parseUnits("1", "gwei")
      });
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Base URI set successfully.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

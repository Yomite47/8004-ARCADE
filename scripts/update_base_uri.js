const hre = require("hardhat");

async function main() {
  const contractAddress = "0x2AE8969DDDAf15e268792B4c361c45E20993ceC0";
  
  // Hardcoded CID
  const newCID = "bafybeifyvxovvrv7nf5mglmrm7emkgashjjahtxlure44b5fwcmzpdwjcu";
  
  const newBaseURI = `ipfs://${newCID}/`;

  console.log(`Updating Base URI for contract at ${contractAddress}`);
  console.log(`New Base URI: ${newBaseURI}`);

  const Arcade8004 = await hre.ethers.getContractFactory("Arcade8004");
  const contract = Arcade8004.attach(contractAddress);

  // Get deployer/owner
  const [owner] = await hre.ethers.getSigners();
  console.log("Sending transaction from:", owner.address);

  const tx = await contract.connect(owner).setBaseURI(newBaseURI);
  console.log("Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("Base URI updated successfully!");
  
  // Verify
  const currentURI = await contract.baseURI();
  console.log("Verified on-chain Base URI:", currentURI);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

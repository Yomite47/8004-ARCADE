const hre = require("hardhat");

async function main() {
  const contractAddress = "0x2AE8969DDDAf15e268792B4c361c45E20993ceC0";
  const Arcade8004 = await hre.ethers.getContractFactory("Arcade8004");
  const contract = Arcade8004.attach(contractAddress);

  console.log("Checking contract at:", contractAddress);

  try {
    const baseURI = await contract.baseURI(); // Note: baseURI is public in the contract
    console.log("Current Base URI:", baseURI);
  } catch (e) {
    console.log("Could not read baseURI (might be internal or named differently?)");
    // In the code it is public: string public baseURI;
    console.error(e);
  }

  try {
    const uri = await contract.tokenURI(1);
    console.log("Token URI for ID 1:", uri);
  } catch (e) {
    console.log("Could not read tokenURI for ID 1 (maybe not minted yet?)");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

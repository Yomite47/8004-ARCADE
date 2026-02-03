require("dotenv").config();
const hre = require("hardhat");

const CONTRACT = "0x2AE8969DDDAf15e268792B4c361c45E20993ceC0";

// Batch 1 Metadata CID
const NEW_CID = "bafybeiejea2tivsu7qzifejoeujodazc5rfih3qbnqhqqa7yw53i5iuiqy";

async function main() {
  const baseUri = `ipfs://${NEW_CID}/`;
  console.log("Setting baseURI to:", baseUri);

  const [signer] = await hre.ethers.getSigners();
  console.log("Signer:", await signer.getAddress());

  const abi = ["function setBaseURI(string _newBaseURI)"];
  const contract = new hre.ethers.Contract(CONTRACT, abi, signer);
  
  try {
      const tx = await contract.setBaseURI(baseUri);
      console.log("Tx sent:", tx.hash);
      const rec = await tx.wait();
      console.log("Confirmed in block:", rec.blockNumber);
  } catch (err) {
      console.error("Error sending tx:", err);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

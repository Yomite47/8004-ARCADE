require("dotenv").config();
const hre = require("hardhat");

const CONTRACT = "0x2AE8969DDDAf15e268792B4c361c45E20993ceC0";

async function main() {
  const cid = process.env.METADATA_CID;
  if (!cid) {
    throw new Error("Set METADATA_CID in .env to the new metadata folder CID");
  }
  const baseUri = `ipfs://${cid}/`;
  console.log("Setting baseURI to:", baseUri);

  const [signer] = await hre.ethers.getSigners();
  console.log("Signer:", await signer.getAddress());

  const abi = ["function setBaseURI(string _newBaseURI)"];
  const contract = new hre.ethers.Contract(CONTRACT, abi, signer);
  const tx = await contract.setBaseURI(baseUri);
  console.log("Tx sent:", tx.hash);
  const rec = await tx.wait();
  console.log("Confirmed in block:", rec.blockNumber);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

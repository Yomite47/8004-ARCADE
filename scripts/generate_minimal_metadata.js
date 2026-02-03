const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const CONTRACT = "0x2AE8969DDDAf15e268792B4c361c45E20993ceC0";
const IMAGES_CID = "bafybeie7gculxwgutnszmz7emdbauhiwug7a3xgd6h47bhomncqv5677my";
const OUT_DIR = path.resolve(__dirname, "..", "generated_metadata");

const ABI = [
  "function totalSupply() view returns (uint256)"
];

async function main() {
  const provider = ethers.getDefaultProvider("mainnet");
  const contract = new ethers.Contract(CONTRACT, ABI, provider);
  const total = await contract.totalSupply();
  const supply = Number(total);
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

  console.log("Generating minimal metadata for token IDs 1..", supply);
  for (let id = 1; id <= supply; id++) {
    const meta = {
      name: `8004 Arcade #${id}`,
      description: "8004 Arcade – skill-based mint.",
      image: `ipfs://${IMAGES_CID}/${id}.png`
    };
    const file = path.join(OUT_DIR, `${id}.json`);
    fs.writeFileSync(file, JSON.stringify(meta, null, 2));
  }
  console.log("Done. Folder:", OUT_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

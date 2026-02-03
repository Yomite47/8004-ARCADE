const { ethers } = require("ethers");

// Minimal ABI to read baseURI() and tokenURI(uint256)
const ABI = [
  "function baseURI() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)"
];

async function main() {
  const address = "0x2AE8969DDDAf15e268792B4c361c45E20993ceC0";
  const provider = ethers.getDefaultProvider("mainnet");
  const contract = new ethers.Contract(address, ABI, provider);

  const base = await contract.baseURI();
  console.log("baseURI:", base);

  const ids = [1, 2, 10, 100, 383];
  for (const id of ids) {
    try {
      const uri = await contract.tokenURI(id);
      console.log(`tokenURI(${id}):`, uri);
    } catch (e) {
      console.log(`tokenURI(${id}) error:`, e.message || e);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

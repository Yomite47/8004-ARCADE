const axios = require("axios");

const CID = "bafybeifyvxovvrv7nf5mglmrm7emkgashjjahtxlure44b5fwcmzpdwjcu";
const TOKEN_ID = process.env.TOKEN_ID || "383";

const gateways = [
  `https://ipfs.io/ipfs/${CID}/${TOKEN_ID}.json`,
  `https://gateway.pinata.cloud/ipfs/${CID}/${TOKEN_ID}.json`,
  `https://cloudflare-ipfs.com/ipfs/${CID}/${TOKEN_ID}.json`
];

async function check() {
  for (const url of gateways) {
    try {
      const res = await axios.get(url, { timeout: 15000 });
      console.log("OK:", url, "status", res.status, "length", JSON.stringify(res.data).length);
      console.log("sample:", JSON.stringify(res.data).slice(0, 200));
    } catch (e) {
      console.log("ERR:", url, e.response ? e.response.status : e.message);
    }
  }
}

check();

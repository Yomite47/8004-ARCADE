const https = require('https');

const cid = "bafybeifyvxovvrv7nf5mglmrm7emkgashjjahtxlure44b5fwcmzpdwjcu";
const tokenId = "1";
// Try nested folder
const url = `https://gateway.pinata.cloud/ipfs/${cid}/metadata/${tokenId}.json`;

console.log(`Fetching metadata from: ${url}`);

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
        console.log("Status Code:", res.statusCode);
        console.log("Response Body:");
        console.log(data);
        const json = JSON.parse(data);
        console.log("\nParsed JSON:");
        console.log(json);
    } catch (e) {
        console.error("Error parsing JSON:", e.message);
    }
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

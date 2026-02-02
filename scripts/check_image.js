const https = require('https');

const cid = "bafybeie7gculxwgutnszmz7emdbauhiwug7a3xgd6h47bhomncqv5677my";
const filename = "1.png";
const url = `https://gateway.pinata.cloud/ipfs/${cid}/${filename}`;

console.log(`Testing Image URL: ${url}`);

https.get(url, (res) => {
  console.log("Status Code:", res.statusCode);
  if (res.statusCode === 200) {
      console.log("✅ Image is accessible!");
  } else {
      console.log("❌ Image is NOT accessible (Status: " + res.statusCode + ")");
      console.log("The 'images.car' file likely needs to be re-uploaded as a folder.");
  }
}).on("error", (err) => {
  console.log("Error: " + err.message);
});

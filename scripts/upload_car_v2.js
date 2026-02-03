const { PinataSDK } = require("pinata");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: "gateway.pinata.cloud"
});

async function upload() {
  const carPath = path.join(__dirname, '../images.car');
  
  if (!fs.existsSync(carPath)) {
      console.error("❌ images.car not found!");
      return;
  }
  
  const stats = fs.statSync(carPath);
  const sizeMB = stats.size / (1024 * 1024);
  console.log(`🚀 Uploading images.car (${sizeMB.toFixed(2)} MB)...`);
  
  try {
      // Using fs.openAsBlob if available (Node 20+) to avoid loading entire file into buffer
      let blob;
      if (typeof fs.openAsBlob === 'function') {
          console.log("Using fs.openAsBlob (memory efficient)...");
          blob = await fs.openAsBlob(carPath);
      } else {
          console.log("Using fs.readFileSync (high memory usage)...");
          const buffer = fs.readFileSync(carPath);
          blob = new Blob([buffer]);
      }
      
      const file = new File([blob], "images.car", { type: "application/car" });

      const result = await pinata.upload.public.file(file);
      console.log("✅ Upload successful!");
      console.log(result);
      
      // Save CID
      // The result structure depends on SDK version, usually has `cid` or `IpfsHash`
      const cid = result.cid || result.IpfsHash;
      if (cid) {
        fs.writeFileSync(path.join(__dirname, '../image_cid.txt'), cid);
        console.log(`💾 Saved CID to image_cid.txt: ${cid}`);
      }
      
  } catch (e) {
      console.error("❌ Upload failed:", e);
  }
}

upload();

const { PinataSDK } = require("pinata-web3");
const path = require("path");
require("dotenv").config();

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: "gateway.pinata.cloud" 
});

async function upload() {
  try {
    const folderPath = path.join(__dirname, "../assets/images");
    console.log(`🚀 Starting upload for folder: ${folderPath}`);
    console.log("This might take a while for 5555 images...");
    
    const result = await pinata.upload.folder(folderPath);
    
    console.log("✅ Upload successful!");
    console.log("CID:", result.IpfsHash);
    console.log("Timestamp:", result.Timestamp);
    
    // Save CID to file for later use
    const fs = require('fs');
    fs.writeFileSync(path.join(__dirname, '../image_cid.txt'), result.IpfsHash);
    
  } catch (error) {
    console.error("❌ Upload failed:", error);
  }
}

upload();

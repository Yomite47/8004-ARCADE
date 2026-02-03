console.log("Script started");
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
    console.log("🚀 Starting CAR Upload...");

    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretApiKey = process.env.PINATA_SECRET_KEY;
    
    console.log("API Key present:", !!pinataApiKey);

    if (!pinataApiKey || !pinataSecretApiKey) {
        console.error("❌ No Pinata API/Secret found.");
        process.exit(1);
    }

    const pinata = new pinataSDK(pinataApiKey, pinataSecretApiKey);

    const carPath = path.join(__dirname, '../images.car');
    if (!fs.existsSync(carPath)) {
        console.error("❌ images.car not found. Run 'npx ipfs-car pack ...' first.");
        process.exit(1);
    }

    console.log(`📦 Uploading CAR file: ${carPath}`);
    
    const readableStreamForFile = fs.createReadStream(carPath);
    const options = {
        pinataMetadata: {
            name: "8004-Arcade-Images-CAR",
        },
        pinataOptions: {
            cidVersion: 1
        }
    };

    try {
        const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
        console.log("✅ Upload Complete!");
        console.log("CID:", result.IpfsHash);
        console.log("Is this the same as ipfs-car output?");
    } catch (err) {
        console.error("❌ Upload Failed:", err);
    }
}

main();

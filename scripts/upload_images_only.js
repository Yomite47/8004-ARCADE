const pinataSDK = require('@pinata/sdk');
const path = require('path');
require('dotenv').config();

async function main() {
    console.log("🚀 Starting Image Upload...");

    // 1. Get Credentials
    const pinataJWT = process.env.PINATA_JWT;
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretApiKey = process.env.PINATA_SECRET_KEY;

    let pinata;

    if (pinataJWT) {
        pinata = new pinataSDK({ pinataJWTKey: pinataJWT });
    } else if (pinataApiKey && pinataSecretApiKey) {
        pinata = new pinataSDK(pinataApiKey, pinataSecretApiKey);
    } else {
        console.error("❌ No Pinata credentials found in .env file.");
        process.exit(1);
    }

    try {
        await pinata.testAuthentication();
        console.log("✅ Pinata Connected");
    } catch (err) {
        console.error("❌ Pinata Auth Failed:", err.message);
        process.exit(1);
    }

    const imagesPath = path.join(__dirname, '../public/ready_for_upload/images');
    console.log(`\n📦 Uploading Images from: ${imagesPath}`);
    
    try {
        const res = await pinata.pinFromFS(imagesPath, {
            pinataMetadata: { name: "8004-Arcade-Images-Fixed-v2" },
            pinataOptions: { cidVersion: 1 }
        });
        console.log(`✅ Images Uploaded! CID: ${res.IpfsHash}`);
    } catch (err) {
        console.error("❌ Image Upload Failed:", err.message || err);
    }
}

main();

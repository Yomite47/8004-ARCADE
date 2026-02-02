const pinataSDK = require('@pinata/sdk');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function main() {
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
        console.error("Please add PINATA_JWT (recommended) or PINATA_API_KEY and PINATA_SECRET_KEY to your .env file.");
        process.exit(1);
    }

    // 2. Test Connection
    try {
        const result = await pinata.testAuthentication();
        console.log("✅ Pinata Connected!", result);
    } catch (err) {
        console.error("❌ Pinata Authentication Failed:", err.message);
        process.exit(1);
    }

    // 3. Define Source Folder
    const sourcePath = path.join(__dirname, '../public/ready_for_upload/metadata');
    
    if (!fs.existsSync(sourcePath)) {
        console.error(`❌ Source folder not found: ${sourcePath}`);
        process.exit(1);
    }

    console.log(`🚀 Uploading metadata folder: ${sourcePath}`);
    console.log("This may take a few minutes for large collections...");

    // 4. Upload to Pinata
    const options = {
        pinataMetadata: {
            name: "8004-Arcade-Metadata",
        },
        pinataOptions: {
            cidVersion: 1
        }
    };

    try {
        const result = await pinata.pinFromFS(sourcePath, options);
        console.log("\n✅ Upload Complete!");
        console.log("--------------------------------------------------");
        console.log("CID:", result.IpfsHash);
        console.log("Timestamp:", result.Timestamp);
        console.log("--------------------------------------------------");
        console.log(`\nNext Step: Update your contract with this CID.`);
        console.log(`Run: npx hardhat run scripts/update_base_uri.js --network mainnet -- ${result.IpfsHash}`);
    } catch (err) {
        console.error("❌ Upload Failed:", err);
    }
}

main();

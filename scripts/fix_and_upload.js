const pinataSDK = require('@pinata/sdk');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function main() {
    console.log("🚀 Starting Full Repair Process...");

    const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

    try {
        await pinata.testAuthentication();
        console.log("✅ Pinata Connected");
    } catch (err) {
        console.error("❌ Pinata Auth Failed:", err.message);
        process.exit(1);
    }

    // Upload Images
    const imagesPath = path.join(__dirname, '../public/ready_for_upload/images');
    console.log(`\n📦 Uploading Images from: ${imagesPath}`);
    console.log("⏳ This might take a minute...");
    
    let imageCid;
    try {
        const res = await pinata.pinFromFS(imagesPath, {
            pinataMetadata: { name: "8004-Arcade-Images-Fixed" },
            pinataOptions: { cidVersion: 1 }
        });
        imageCid = res.IpfsHash;
        console.log(`✅ Images Uploaded! CID: ${imageCid}`);
    } catch (err) {
        console.error("❌ Image Upload Failed:", err.message || err);
        console.log("\n⚠️  AUTOMATIC UPLOAD TIMED OUT AGAIN.");
        console.log("👉 Please upload the 'public/ready_for_upload/images' folder MANUALLY to https://app.pinata.cloud");
        console.log("   Then run: node scripts/update_metadata_cid.js <YOUR_IMAGE_CID>");
        process.exit(1);
    }

    // Update Metadata
    const metadataPath = path.join(__dirname, '../public/ready_for_upload/metadata');
    console.log(`\n📝 Updating Metadata files...`);
    
    const files = fs.readdirSync(metadataPath);
    for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filePath = path.join(metadataPath, file);
        let content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const fileName = content.image.split('/').pop();
        content.image = `ipfs://${imageCid}/${fileName}`;
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    }
    console.log(`✅ Metadata files updated.`);

    // Upload Metadata
    console.log(`\n📦 Uploading Metadata...`);
    try {
        const res = await pinata.pinFromFS(metadataPath, {
            pinataMetadata: { name: "8004-Arcade-Metadata-Fixed" },
            pinataOptions: { cidVersion: 1 }
        });
        console.log(`✅ Metadata Uploaded! CID: ${res.IpfsHash}`);
        console.log("\n🎉 DONE! Run this to update contract:");
        console.log(`npx hardhat run scripts/update_base_uri.js --network mainnet -- ${res.IpfsHash}`);
    } catch (err) {
        console.error("❌ Metadata Upload Failed:", err);
    }
}

main();

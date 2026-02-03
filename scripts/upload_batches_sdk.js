const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize with API Key and Secret (more reliable for pinFromFS in older SDKs)
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

const SPLIT_DIR = path.join(__dirname, '../public/split_images');
const OUTPUT_FILE = path.join(__dirname, '../batch_folder_cids.json');

async function uploadBatchesSDK() {
    try {
        await pinata.testAuthentication();
        console.log("✅ Authenticated with Pinata SDK");
    } catch (err) {
        console.error("❌ Authentication failed:", err);
        return;
    }

    if (!fs.existsSync(SPLIT_DIR)) {
        console.error("Split images directory not found.");
        return;
    }

    const batches = fs.readdirSync(SPLIT_DIR).filter(f => f.startsWith('batch_'));
    
    // Sort
    batches.sort((a, b) => {
        const numA = parseInt(a.replace('batch_', ''));
        const numB = parseInt(b.replace('batch_', ''));
        return numA - numB;
    });

    const results = {};

    console.log(`Found ${batches.length} batches to upload.`);

    for (const batch of batches) {
        const batchPath = path.join(SPLIT_DIR, batch);
        console.log(`\n🚀 Uploading ${batch} (this may take a while)...`);
        
        try {
            const options = {
                pinataMetadata: {
                    name: `8004-Batch-${batch}`,
                },
                pinataOptions: {
                    cidVersion: 1
                }
            };

            const result = await pinata.pinFromFS(batchPath, options);
            console.log(`✅ Uploaded ${batch}`);
            console.log(`   CID: ${result.IpfsHash}`);
            
            results[batch] = result.IpfsHash;

        } catch (error) {
            console.error(`❌ Failed to upload ${batch}:`, error.message);
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`\n💾 Saved Folder CIDs to ${OUTPUT_FILE}`);
}

uploadBatchesSDK();

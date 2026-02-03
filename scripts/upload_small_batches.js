const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

const SPLIT_DIR = path.join(__dirname, '../public/split_images_small');
const OUTPUT_FILE = path.join(__dirname, '../small_batch_cids.json');

async function uploadSmallBatches() {
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
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            Object.assign(results, JSON.parse(fs.readFileSync(OUTPUT_FILE)));
        } catch (e) {}
    }

    console.log(`Found ${batches.length} batches.`);

    for (const batch of batches) {
        if (results[batch]) {
            console.log(`⏩ Skipping ${batch} (already uploaded: ${results[batch]})`);
            continue;
        }

        const batchPath = path.join(SPLIT_DIR, batch);
        console.log(`\n🚀 Uploading ${batch}...`);
        
        try {
            const options = {
                pinataMetadata: {
                    name: `8004-SmallBatch-${batch}`,
                },
                pinataOptions: {
                    cidVersion: 1
                }
            };

            const result = await pinata.pinFromFS(batchPath, options);
            console.log(`✅ Uploaded ${batch}`);
            console.log(`   CID: ${result.IpfsHash}`);
            
            results[batch] = result.IpfsHash;
            
            // Save progress immediately
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));

            // Wait 1 second to be nice
            await new Promise(r => setTimeout(r, 1000));

        } catch (error) {
            console.error(`❌ Failed to upload ${batch}:`, error);
            // Don't exit, try next one. 
            // We can re-run script to retry failed ones.
        }
    }

    console.log(`\n🎉 Done! Saved CIDs to ${OUTPUT_FILE}`);
}

uploadSmallBatches();

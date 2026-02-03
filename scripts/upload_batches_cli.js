const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SPLIT_DIR = path.join(__dirname, '../public/split_images');
const OUTPUT_FILE = path.join(__dirname, '../batch_folder_cids.json');

async function uploadBatchesCli() {
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

    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
        console.error("PINATA_JWT not found in .env");
        return;
    }

    const results = {};

    console.log(`Found ${batches.length} batches to upload via CLI.`);

    for (const batch of batches) {
        const batchPath = path.join(SPLIT_DIR, batch);
        console.log(`\n🚀 Uploading ${batch}...`);

        try {
            // Run CLI command
            // The CLI usually outputs something like "IpfsHash: <CID>"
            // We need to capture stdout.
            // Removed --name as it caused errors
            const cmd = `npx pinata-upload-cli -a "${jwt}" -u "${batchPath}"`;
            const output = execSync(cmd, { encoding: 'utf8' });
            
            console.log(output);

            // Extract CID from output
            // Output format example: "IpfsHash: Qm..."
            const match = output.match(/IpfsHash:\s*([a-zA-Z0-9]+)/);
            if (match && match[1]) {
                const cid = match[1];
                console.log(`✅ Captured CID: ${cid}`);
                results[batch] = cid;
            } else {
                console.warn(`⚠️ Could not parse CID from output for ${batch}`);
            }

        } catch (error) {
            console.error(`❌ Failed to upload ${batch}:`, error.message);
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`\n💾 Saved Folder CIDs to ${OUTPUT_FILE}`);
}

uploadBatchesCli();

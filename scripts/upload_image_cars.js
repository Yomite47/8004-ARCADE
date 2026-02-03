const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

const CAR_DIR = path.join(__dirname, '../car_files');
const BATCH_INFO_FILE = path.join(CAR_DIR, 'batch_info.json');
const OUTPUT_FILE = path.join(CAR_DIR, 'uploaded_cids.json');

const JWT = process.env.PINATA_JWT;

async function uploadCars() {
    if (!fs.existsSync(BATCH_INFO_FILE)) {
        console.error("Batch info not found.");
        return;
    }

    const batches = JSON.parse(fs.readFileSync(BATCH_INFO_FILE));
    const results = {};

    // Load existing results if any
    if (fs.existsSync(OUTPUT_FILE)) {
        Object.assign(results, JSON.parse(fs.readFileSync(OUTPUT_FILE)));
    }

    console.log(`Found ${batches.length} CAR files to upload.`);

    for (const batch of batches) {
        if (results[batch.batchName]) {
            console.log(`⏩ Skipping ${batch.batchName} (already uploaded: ${results[batch.batchName]})`);
            continue;
        }

        const carPath = path.join(CAR_DIR, batch.carFile);
        console.log(`\n🚀 Uploading ${batch.batchName} (${batch.carFile})...`);
        
        try {
            // Use curl
            // Need to escape quotes if necessary, but filenames are simple.
            const cmd = `curl -X POST "https://api.pinata.cloud/pinning/pinFileToIPFS" \
                -H "Authorization: Bearer ${JWT}" \
                -F "file=@${carPath}"`;
            
            // On Windows, execSync uses cmd.exe or PowerShell.
            // Using `curl.exe` specifically to avoid PowerShell alias issues.
            // And handling long JWT might be tricky in command line length, but usually okay.
            
            // Use a temporary script file to run the curl command to avoid CLI length limits or escaping issues?
            // Or just run it. 100MB upload might take a bit.
            
            const output = execSync(`curl.exe -s -X POST "https://api.pinata.cloud/pinning/pinFileToIPFS" -H "Authorization: Bearer ${JWT}" -F "file=@${carPath}"`, { 
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer for output
            });
            
            const response = JSON.parse(output.toString());
            
            if (response.IpfsHash) {
                console.log(`✅ Uploaded ${batch.batchName}`);
                console.log(`   CID: ${response.IpfsHash}`);
                results[batch.batchName] = response.IpfsHash;
                fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
            } else {
                console.error(`❌ Upload failed response:`, response);
            }

        } catch (error) {
            console.error(`❌ Failed to upload ${batch.batchName}:`, error.message);
            // Print stdout/stderr if available
            if (error.stdout) console.log("stdout:", error.stdout.toString());
            if (error.stderr) console.log("stderr:", error.stderr.toString());
        }
    }

    console.log(`\n🎉 Done! Saved CIDs to ${OUTPUT_FILE}`);
}

uploadCars();

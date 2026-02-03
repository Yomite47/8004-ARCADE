const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

const CAR_DIR = path.join(__dirname, '../public/car_batches');
const OUTPUT_FILE = path.join(__dirname, '../batch_cids.json');

async function uploadCars() {
    try {
        await pinata.testAuthentication();
        console.log("✅ Authenticated with Pinata");
    } catch (err) {
        console.error("❌ Authentication failed:", err);
        return;
    }

    if (!fs.existsSync(CAR_DIR)) {
        console.error("CAR directory not found.");
        return;
    }

    const files = fs.readdirSync(CAR_DIR).filter(f => f.endsWith('.car'));
    
    // Sort
    files.sort((a, b) => {
        const numA = parseInt(a.replace('batch_', '').replace('.car', ''));
        const numB = parseInt(b.replace('batch_', '').replace('.car', ''));
        return numA - numB;
    });

    const results = {};

    console.log(`Found ${files.length} CAR files to upload.`);

    for (const file of files) {
        const filePath = path.join(CAR_DIR, file);
        const readableStreamForFile = fs.createReadStream(filePath);
        
        console.log(`\n🚀 Uploading ${file}...`);
        
        try {
            // We use pinFileToIPFS. 
            // Important: For CAR files, we might need specific options or just treat it as a file.
            // If we treat it as a regular file, the CID will be the CID of the CAR file itself, not the directory inside.
            // HOWEVER, Pinata supports "pinning a CAR file" specifically?
            // Actually, usually you just upload the CAR file and Pinata unpacks it?
            // Let's check if there is a specific option.
            // If not, we might just get the CID of the file.
            // BUT, we already know the Root CID of the content from the packing step!
            // The packing step gave us: bafybeicu7fzwrdp6ij3wbwcptzsfcrltuu2hadjpr6l4kekl4nbjyxof6m (for batch 1)
            // If we upload this CAR, we want Pinata to pin THAT CID.
            
            // Let's try uploading with the name.
            const options = {
                pinataMetadata: {
                    name: `8004-Batch-${file}`,
                },
                pinataOptions: {
                    cidVersion: 1
                }
            };

            const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
            console.log(`✅ Uploaded ${file}`);
            console.log(`   Pinata CID: ${result.IpfsHash}`);
            
            // We should store this.
            results[file] = result.IpfsHash;

        } catch (error) {
            console.error(`❌ Failed to upload ${file}:`, error.message);
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`\n💾 Saved CIDs to ${OUTPUT_FILE}`);
}

uploadCars();

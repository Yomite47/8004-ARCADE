const pinataSDK = require('@pinata/sdk');
const path = require('path');
require('dotenv').config();

// Use the new credentials provided by the user
const apiKey = "ce29018ccf45793ad08c";
const secretKey = "15c9b90ccebcf04ca87089c6a845027a603be59dffcf86e3e77d76813bbcf40e";

const pinata = new pinataSDK(apiKey, secretKey);

async function uploadFolder() {
    const sourcePath = path.join(__dirname, '../public/images');
    
    console.log(`🚀 Uploading folder: ${sourcePath}`);
    console.log("This involves pinning 5555 files. Please be patient.");

    try {
        const options = {
            pinataMetadata: {
                name: '8004-Images-Folder'
            },
            pinataOptions: {
                cidVersion: 1
            }
        };

        const result = await pinata.pinFromFS(sourcePath, options);
        console.log("✅ Upload successful!");
        console.log(result);
        
        // Result should contain IpfsHash which is the root CID
        const cid = result.IpfsHash;
        const fs = require('fs');
        fs.writeFileSync(path.join(__dirname, '../image_cid.txt'), cid);
        console.log(`💾 Saved CID to image_cid.txt: ${cid}`);

    } catch (err) {
        console.error("❌ Upload failed:", err);
    }
}

uploadFolder();

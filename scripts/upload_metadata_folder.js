const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');

const apiKey = process.env.PINATA_API_KEY;
const apiSecret = process.env.PINATA_SECRET_KEY;

const pinata = new pinataSDK(apiKey, apiSecret);

const sourcePath = path.join(__dirname, '../generated_metadata');

async function upload() {
    console.log(`Uploading folder: ${sourcePath}`);
    try {
        const options = {
            pinataMetadata: {
                name: '8004_Arcade_Metadata_Fix',
            },
            pinataOptions: {
                cidVersion: 1
            }
        };
        const result = await pinata.pinFromFS(sourcePath, options);
        console.log("Upload successful!");
        console.log("CID:", result.IpfsHash);
        console.log("Timestamp:", result.Timestamp);
    } catch (err) {
        console.error("Error uploading:", err);
    }
}

upload();

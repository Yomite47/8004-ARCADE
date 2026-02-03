const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

const CAR_FILE = path.join(__dirname, '../images.car');

async function uploadCar() {
    try {
        console.log("Checking Pinata connection...");
        await pinata.testAuthentication();
        console.log("✅ Authenticated");

        if (!fs.existsSync(CAR_FILE)) {
            console.error("images.car not found!");
            return;
        }

        console.log(`🚀 Uploading images.car (${(fs.statSync(CAR_FILE).size / 1024 / 1024).toFixed(2)} MB)...`);
        
        // Pinata SDK pinFromFS treats a single file as a single file.
        // To upload a CAR file properly to be interpreted as a DAG, we might need a specific call or just hope pinFromFS handles .car extension?
        // Actually, usually you just upload it.
        // Let's see what CID we get.
        
        const stream = fs.createReadStream(CAR_FILE);
        const options = {
            pinataMetadata: {
                name: '8004-Images-CAR',
            },
            pinataOptions: {
                cidVersion: 1
            }
        };

        const result = await pinata.pinFromFS(CAR_FILE, options);
        console.log(`✅ Uploaded images.car`);
        console.log(`   CID: ${result.IpfsHash}`);
        
        // If the CID matches the one from ipfs-car, we are good.
        // ipfs-car output: bafybeifwkkb67q2jvfnd7mym4gnani4zq3abuowx2jjnqeojrrojo47dtu

    } catch (error) {
        console.error("❌ Error uploading CAR:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

uploadCar();

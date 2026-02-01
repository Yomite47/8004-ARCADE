const pinataSDK = require('@pinata/sdk');
const path = require('path');

const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhOTZiOWY5Mi01MjJmLTQxMzUtYjFjMi0xY2U5ZTc0MWNlNTIiLCJlbWFpbCI6Im9sYWZvbGFyaW40N0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYTg0NmQ1YWI1NzFmNmY2YjFkMjciLCJzY29wZWRLZXlTZWNyZXQiOiI4NDRjODcwNmNiNDk5MTI5MTI5YzI2ZTFiZDc3ZTY4YjdmNTA3MGRiMWNiMTdhMWQ2M2Y1NDhjZmU0NzU1NWYzIiwiZXhwIjoxODAxNDc2NTY2fQ.hclBH5qvpeXK13Ctv4EyPATH5qJRSfY1WUpj3_oKjyE';

const pinata = new pinataSDK({ pinataJWTKey: JWT });

async function uploadFolder() {
    const sourcePath = path.resolve("public/ready_for_upload/metadata");
    const options = {
        pinataMetadata: {
            name: 'metadata_folder'
        },
        pinataOptions: {
            cidVersion: 1
        }
    };

    try {
        console.log(`Uploading folder via @pinata/sdk: ${sourcePath}`);
        const result = await pinata.pinFromFS(sourcePath, options);
        console.log("Upload Success!");
        console.log(result);
    } catch (err) {
        console.log("Upload Error:");
        console.log(err);
    }
}
uploadFolder();

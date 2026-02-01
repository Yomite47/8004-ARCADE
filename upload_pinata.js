const pinataSDK = require('@pinata/sdk');
const path = require('path');

// User provided JWT
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhOTZiOWY5Mi01MjJmLTQxMzUtYjFjMi0xY2U5ZTc0MWNlNTIiLCJlbWFpbCI6Im9sYWZvbGFyaW40N0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYTg0NmQ1YWI1NzFmNmY2YjFkMjciLCJzY29wZWRLZXlTZWNyZXQiOiI4NDRjODcwNmNiNDk5MTI5MTI5YzI2ZTFiZDc3ZTY4YjdmNTA3MGRiMWNiMTdhMWQ2M2Y1NDhjZmU0NzU1NWYzIiwiZXhwIjoxODAxNDc2NTY2fQ.hclBH5qvpeXK13Ctv4EyPATH5qJRSfY1WUpj3_oKjyE';

const pinata = new pinataSDK({ pinataJWTKey: JWT });

const sourcePath = process.argv[2];
const folderName = process.argv[3] || 'uploaded-folder';

if (!sourcePath) {
    console.error('Usage: node upload_pinata.js <path> [name]');
    process.exit(1);
}

const absolutePath = path.resolve(sourcePath);

async function upload() {
    try {
        console.log(`Authenticating...`);
        const testAuth = await pinata.testAuthentication();
        console.log('Auth status:', testAuth.message);

        console.log(`Uploading ${absolutePath} to Pinata as "${folderName}"...`);
        console.log('This may take a while for large folders...');
        
        const options = {
            pinataMetadata: {
                name: folderName,
            },
            pinataOptions: {
                cidVersion: 0
            }
        };
        
        // pinFromFS is the key. It recursively pins.
        const result = await pinata.pinFromFS(absolutePath, options);
        console.log('Upload successful!');
        console.log('IPFS Hash:', result.IpfsHash);
    } catch (err) {
        console.error('Upload failed:', err);
        process.exit(1);
    }
}

upload();

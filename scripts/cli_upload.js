const { execSync } = require('child_process');
require('dotenv').config();

const jwt = process.env.PINATA_JWT;
const apiKey = process.env.PINATA_API_KEY;
const apiSecret = process.env.PINATA_SECRET_KEY;

console.log("Debug: JWT present:", !!jwt);
console.log("Debug: API Key present:", !!apiKey);
console.log("Debug: API Secret present:", !!apiSecret);

if (jwt) {
    try {
        console.log("Starting upload with pinata-upload-cli using JWT...");
        execSync(`npx pinata-upload-cli -a "${jwt}" -u "public/ready_for_upload/images"`, { stdio: 'inherit' });
    } catch (error) {
        console.error("Upload failed with JWT");
        process.exit(1);
    }
} else if (apiKey && apiSecret) {
    console.log("JWT not found, but API Key/Secret found.");
    console.log("The pinata-upload-cli requires a JWT for standard uploads via -a flag.");
    console.log("Please create a JWT in Pinata dashboard and add it to .env as PINATA_JWT.");
    process.exit(1);
} else {
    console.error("No credentials found in .env");
    process.exit(1);
}

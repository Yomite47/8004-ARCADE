const fs = require('fs');
const path = require('path');

const metadataPath = path.join(__dirname, '../public/ready_for_upload/metadata');
const imageCid = process.argv[2];

if (!imageCid) {
    console.error("Please provide the Image CID as an argument.");
    console.error("Usage: node scripts/update_metadata_cid.js <IMAGE_CID>");
    process.exit(1);
}

console.log(`Updating metadata files in ${metadataPath} with Image CID: ${imageCid}`);

const files = fs.readdirSync(metadataPath);
let count = 0;

for (const file of files) {
    if (file.endsWith('.json')) {
        const filePath = path.join(metadataPath, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Update image URL
        // Assumes file name matches image name (e.g. 1.json -> 1.png)
        const id = file.replace('.json', '');
        content.image = `ipfs://${imageCid}/${id}.png`;
        
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        count++;
    }
}

console.log(`✅ Updated ${count} metadata files!`);
console.log("Now upload the 'public/ready_for_upload/metadata' folder to Pinata.");

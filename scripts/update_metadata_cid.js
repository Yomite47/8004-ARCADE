const fs = require('fs');
const path = require('path');

const metadataDir = path.join(__dirname, '../dist/ready_for_upload/metadata');
const newCid = 'bafybeie7gculxwgutnszmz7emdbauhiwug7a3xgd6h47bhomncqv5677my';

if (!fs.existsSync(metadataDir)) {
    console.error(`❌ Metadata directory not found: ${metadataDir}`);
    process.exit(1);
}

console.log(`🚀 Updating metadata in ${metadataDir} with new CID: ${newCid}...`);

const files = fs.readdirSync(metadataDir);
let count = 0;

files.forEach(file => {
    if (file.endsWith('.json')) {
        const filePath = path.join(metadataDir, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const json = JSON.parse(content);
            
            // Check if update is needed
            if (json.image && !json.image.includes(newCid)) {
                // Replace the old CID part or construct new URL
                // Assuming format ipfs://CID/filename.png
                const fileName = path.basename(json.image); // e.g., 1.png
                
                // If the old format was different, we might need more robust parsing
                // But based on previous read: "ipfs://bafy.../1.png"
                
                // Let's just extract the filename and rebuild
                const imageFilename = json.image.split('/').pop();
                
                json.image = `ipfs://${newCid}/${imageFilename}`;
                
                fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
                count++;
            }
        } catch (e) {
            console.error(`❌ Error processing ${file}:`, e.message);
        }
    }
});

console.log(`✅ Updated ${count} metadata files.`);

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SPLIT_DIR = path.join(__dirname, '../public/split_images');
const CAR_DIR = path.join(__dirname, '../public/car_batches');

async function packBatches() {
    if (!fs.existsSync(SPLIT_DIR)) {
        console.error("Split images directory not found.");
        return;
    }

    if (!fs.existsSync(CAR_DIR)) {
        fs.mkdirSync(CAR_DIR, { recursive: true });
    }

    const batches = fs.readdirSync(SPLIT_DIR).filter(f => f.startsWith('batch_'));
    
    // Sort batches naturally
    batches.sort((a, b) => {
        const numA = parseInt(a.replace('batch_', ''));
        const numB = parseInt(b.replace('batch_', ''));
        return numA - numB;
    });

    console.log(`Found ${batches.length} batches to pack.`);

    for (const batch of batches) {
        const sourcePath = path.join(SPLIT_DIR, batch);
        const carName = `${batch}.car`;
        const carPath = path.join(CAR_DIR, carName);

        console.log(`Packing ${batch} into ${carName}...`);
        
        try {
            // Using npx ipfs-car pack
            // Ensure we use quotes for paths to handle spaces if any
            execSync(`npx ipfs-car pack "${sourcePath}" --output "${carPath}"`, { stdio: 'inherit' });
            console.log(`✅ Packed ${batch}`);
        } catch (error) {
            console.error(`❌ Failed to pack ${batch}:`, error.message);
        }
    }

    console.log(`\n🎉 All batches packed into CAR files in: ${CAR_DIR}`);
}

packBatches();

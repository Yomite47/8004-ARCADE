const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SOURCE_DIR = path.join(__dirname, '../public/ready_for_upload/images');
const TEMP_BASE = path.join(__dirname, '../public/temp_images');
const CAR_DIR = path.join(__dirname, '../car_files');

const BATCH_SIZE = 1000;

async function splitAndPack() {
    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`Source directory not found: ${SOURCE_DIR}`);
        return;
    }

    // Clean up
    if (fs.existsSync(TEMP_BASE)) fs.rmSync(TEMP_BASE, { recursive: true, force: true });
    if (fs.existsSync(CAR_DIR)) fs.rmSync(CAR_DIR, { recursive: true, force: true });
    
    fs.mkdirSync(TEMP_BASE, { recursive: true });
    fs.mkdirSync(CAR_DIR, { recursive: true });

    const files = fs.readdirSync(SOURCE_DIR).filter(f => f.toLowerCase().endsWith('.png'));
    
    // Sort numerically
    files.sort((a, b) => {
        const numA = parseInt(a.replace('.png', ''));
        const numB = parseInt(b.replace('.png', ''));
        return numA - numB;
    });

    console.log(`Found ${files.length} images. Splitting into batches of ${BATCH_SIZE}...`);

    let batchCount = 0;
    const batchInfo = [];

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        batchCount++;
        const batchName = `part_${batchCount}`;
        const batchPath = path.join(TEMP_BASE, batchName);
        fs.mkdirSync(batchPath);

        const chunk = files.slice(i, i + BATCH_SIZE);
        const startId = parseInt(chunk[0].replace('.png', ''));
        const endId = parseInt(chunk[chunk.length - 1].replace('.png', ''));

        console.log(`Processing ${batchName} (IDs ${startId}-${endId})...`);

        // Copy files
        for (const file of chunk) {
            fs.copyFileSync(path.join(SOURCE_DIR, file), path.join(batchPath, file));
        }

        // Pack into CAR
        const carName = `images_${batchName}.car`;
        const carPath = path.join(CAR_DIR, carName);
        
        console.log(`  Packing ${carName}...`);
        
        // ipfs-car pack <dir> --output <car>
        // Note: ipfs-car usually wraps in a directory if we pass a directory.
        // If we pass "public/temp_images/part_1", the root CID will wrap "part_1".
        // So path in IPFS will be /ipfs/<CID>/part_1/1.png
        // We can handle this in metadata.
        
        try {
            execSync(`npx ipfs-car pack "${batchPath}" --output "${carPath}"`, { stdio: 'inherit' });
            
            batchInfo.push({
                batchName,
                carFile: carName,
                startId,
                endId,
                count: chunk.length
            });
        } catch (e) {
            console.error(`  ❌ Failed to pack ${batchName}:`, e.message);
        }
    }

    fs.writeFileSync(path.join(CAR_DIR, 'batch_info.json'), JSON.stringify(batchInfo, null, 2));
    console.log(`\n✅ Created ${batchCount} CAR files in ${CAR_DIR}`);
}

splitAndPack();

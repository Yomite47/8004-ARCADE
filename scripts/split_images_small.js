const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '../public/ready_for_upload/images');
const DEST_BASE = path.join(__dirname, '../public/split_images_small');

// Smaller batch size for stability
const BATCH_SIZE = 250;

async function splitImagesSmall() {
    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`Source directory not found: ${SOURCE_DIR}`);
        return;
    }

    if (fs.existsSync(DEST_BASE)) {
        fs.rmSync(DEST_BASE, { recursive: true, force: true });
    }
    fs.mkdirSync(DEST_BASE, { recursive: true });

    // Read all files
    const files = fs.readdirSync(SOURCE_DIR).filter(f => f.toLowerCase().endsWith('.png'));
    
    // Sort files numerically
    files.sort((a, b) => {
        const numA = parseInt(a.replace('.png', ''));
        const numB = parseInt(b.replace('.png', ''));
        return numA - numB;
    });

    console.log(`Found ${files.length} images.`);

    let batchCount = 0;
    
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        batchCount++;
        const batchFolderName = `batch_${batchCount}`;
        const batchFolderPath = path.join(DEST_BASE, batchFolderName);
        
        fs.mkdirSync(batchFolderPath);

        const chunk = files.slice(i, i + BATCH_SIZE);
        console.log(`Processing ${batchFolderName} (${chunk.length} images)...`);

        for (const file of chunk) {
            const srcPath = path.join(SOURCE_DIR, file);
            const destPath = path.join(batchFolderPath, file);
            fs.copyFileSync(srcPath, destPath);
        }
    }

    console.log(`\n✅ Successfully split ${files.length} images into ${batchCount} small batches.`);
    console.log(`📁 Location: ${DEST_BASE}`);
}

splitImagesSmall();

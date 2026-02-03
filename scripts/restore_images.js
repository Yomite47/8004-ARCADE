const fs = require('fs');
const path = require('path');

const splitDir = path.join(__dirname, '../public/split_images');
const targetDir = path.join(__dirname, '../public/images');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

console.log(`Restoring images from ${splitDir} to ${targetDir}...`);

const batches = fs.readdirSync(splitDir);
let count = 0;

batches.forEach(batch => {
    const batchPath = path.join(splitDir, batch);
    if (fs.statSync(batchPath).isDirectory()) {
        const files = fs.readdirSync(batchPath);
        files.forEach(file => {
            const src = path.join(batchPath, file);
            const dest = path.join(targetDir, file);
            fs.copyFileSync(src, dest); 
            count++;
        });
        console.log(`Processed ${batch}`);
    }
});

console.log(`✅ Restored ${count} images to ${targetDir}`);

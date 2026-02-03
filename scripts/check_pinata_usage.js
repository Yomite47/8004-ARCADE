const pinataSDK = require('@pinata/sdk');
require('dotenv').config();

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

async function checkUsage() {
    try {
        console.log("Checking Pinata connection...");
        const auth = await pinata.testAuthentication();
        console.log("✅ Authenticated:", auth.message);

        // Get pin count
        const filters = {
            status: 'pinned',
            pageLimit: 1
        };
        const result = await pinata.pinList(filters);
        console.log(`\n📊 Current Status:`);
        console.log(`Total Pins: ${result.count}`);
        
        // Pinata doesn't give a direct "storage used" API easily in the free SDK wrapper without iterating, 
        // but the count gives us a hint.
        
        console.log("\nLatest 5 Pins:");
        result.rows.slice(0, 5).forEach(row => {
            console.log(`- ${row.ipfs_pin_hash} (${row.metadata.name || 'No Name'}) - ${row.date_pinned}`);
        });

        console.log("\n💡 Analysis:");
        if (result.count > 0) {
            console.log(`You have ${result.count} files pinned. If you are on the free plan (1GB limit),`);
            console.log("and these are previous failed attempts, we should clear them.");
        } else {
            console.log("You have 0 files pinned. The limit might be related to bandwidth or requests if you are seeing errors.");
        }

    } catch (error) {
        console.error("❌ Error checking Pinata:", error);
    }
}

checkUsage();

const pinataSDK = require('@pinata/sdk');
require('dotenv').config();

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

async function unpinAll() {
    try {
        console.log("Checking Pinata connection...");
        await pinata.testAuthentication();
        console.log("✅ Authenticated");

        // Loop until no more pins
        let hasMore = true;
        
        while (hasMore) {
            const filters = {
                status: 'pinned',
                pageLimit: 1000 
            };
            
            const result = await pinata.pinList(filters);
            
            // Handle different SDK response structures
            const pins = result.rows || result;
            const count = result.count || pins.length;

            if (!Array.isArray(pins) || pins.length === 0) {
                console.log("No pins found to delete.");
                hasMore = false;
                break;
            }

            console.log(`Found ${pins.length} pins to delete...`);

            for (const pin of pins) {
                try {
                    console.log(`🗑️ Unpinning ${pin.ipfs_pin_hash} (${pin.metadata.name})...`);
                    await pinata.unpin(pin.ipfs_pin_hash);
                } catch (e) {
                    console.error(`Failed to unpin ${pin.ipfs_pin_hash}:`, e.message);
                }
            }
            
            // If we fetched fewer than limit, we are done
            if (pins.length < 10) { 
                hasMore = false;
            }
        }
        
        console.log("✅ All pins cleared!");

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

unpinAll();

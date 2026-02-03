const axios = require('axios');

// Switch to checking Arts CID
const ARTS_CID = "bafybeih63zyqxz6c2old3vnzjuohyocvgfxecxq2kafgh2mrbuzmtn6qtu";

const PATHS = [
    "1.png",
    "1.jpg",
    "1"
];

const GATEWAYS = [
    `https://${ARTS_CID}.ipfs.dweb.link/`,
    `https://gateway.pinata.cloud/ipfs/${ARTS_CID}/`
];

async function verify() {
    console.log("Checking ARTS CID...");
    for (const gateway of GATEWAYS) {
        console.log(`\nChecking Gateway Base: ${gateway}`);
        
        for (const path of PATHS) {
            const url = `${gateway}${path}`;
            console.log(`  Trying: ${url}`);
            
            try {
                const res = await axios.get(url, { timeout: 15000 });
                console.log(`  SUCCESS! Found at: ${url}`);
                console.log("  Content Type:", res.headers['content-type']);
                return;
            } catch (err) {
                 if (err.response) {
                    console.log(`  Failed: Status ${err.response.status}`);
                } else {
                    console.log(`  Failed: ${err.message}`);
                }
            }
        }
    }
    console.error("\nAll combinations failed.");
}

verify();

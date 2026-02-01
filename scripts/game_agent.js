const http = require('http');
const { ethers } = require('ethers');
require('dotenv').config();

const PORT = 3000;
const CONTRACT_ADDRESS = "0xec21C17F1CD883aC5CDc449620e4399EaDee33F3"; // Deployed address

const MINT_THRESHOLDS = {
    'RUNNER': 20,
    'VIRUS_WHACK': 20,
    'CYBER_FLAP': 20,
    'BLOCK_BREAKER': 600,
    'SNAKE': 500,
    'SPACE_INVADERS': 1000
};

// Load Private Key
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
    console.error("ERROR: PRIVATE_KEY not found in .env file.");
    process.exit(1);
}

const signer = new ethers.Wallet(PRIVATE_KEY);
console.log(`Game Agent Service starting...`);
console.log(`Agent Address: ${signer.address}`);
console.log(`Contract: ${CONTRACT_ADDRESS}`);

const server = http.createServer(async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && (req.url === '/sign-mint' || req.url === '/api/sign-mint')) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const { wallet, score, game } = data;

                if (!wallet || !score) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Missing wallet or score" }));
                    return;
                }

                console.log(`Received sign request for ${wallet} with score ${score} in game ${game}`);

                const threshold = MINT_THRESHOLDS[game] || 500;
                if (score < threshold) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: `Score below threshold (${threshold})` }));
                    return;
                }

                // Generate Signature
                // Message: keccak256(abi.encodePacked(wallet, contractAddress))
                const messageHash = ethers.solidityPackedKeccak256(
                    ["address", "address"],
                    [wallet, CONTRACT_ADDRESS]
                );

                // Sign the binary hash
                const signature = await signer.signMessage(ethers.getBytes(messageHash));
                
                console.log(`Generated signature for ${wallet}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ signature }));

            } catch (err) {
                console.error("Error processing request:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Internal Server Error" }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`Game Agent Server running at http://localhost:${PORT}`);
});

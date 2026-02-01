import { ethers } from 'ethers';

// Vercel environment variables are available as process.env in serverless functions
// For local development, they are loaded from .env
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = "0xec21C17F1CD883aC5CDc449620e4399EaDee33F3";
const MINT_THRESHOLD = 300;

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!PRIVATE_KEY) {
    console.error("Missing PRIVATE_KEY environment variable");
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    const { wallet, score, game } = req.body;

    if (!wallet || !score) {
      return res.status(400).json({ error: "Missing wallet or score" });
    }

    const threshold = MINT_THRESHOLDS[game] || 500;
    if (score < threshold) {
      return res.status(400).json({ error: `Score below threshold (${threshold})` });
    }

    const signer = new ethers.Wallet(PRIVATE_KEY);
    
    // Generate Signature
    // Message: keccak256(abi.encodePacked(wallet, contractAddress))
    const messageHash = ethers.solidityPackedKeccak256(
        ["address", "address"],
        [wallet, CONTRACT_ADDRESS]
    );

    // Sign the binary hash
    const signature = await signer.signMessage(ethers.getBytes(messageHash));
    
    return res.status(200).json({ signature });

  } catch (err) {
    console.error("Error processing request:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

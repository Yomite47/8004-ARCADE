# Deployment Guide (Hardhat & Pinata)

## 1. Asset Storage (Pinata) - COMPLETED
- **Images CID**: `bafybeie7gculxwgutnszmz7emdbauhiwug7a3xgd6h47bhomncqv5677my`
- **Metadata CID**: `bafybeifyvxovvrv7nf5mglmrm7emkgashjjahtxlure44b5fwcmzpdwjcu`
- The Base URI is configured in `scripts/deploy.js` as: `ipfs://bafybeifyvxovvrv7nf5mglmrm7emkgashjjahtxlure44b5fwcmzpdwjcu/`

## 2. Smart Contract Deployment (Hardhat)
We are using Hardhat to deploy the contract, which gives you full control without relying on third-party deployment platforms.

### Prerequisites
1. Create a `.env` file in the root directory:
   ```
   PRIVATE_KEY=your_wallet_private_key_here
   RPC_URL=your_rpc_url_here (e.g., https://rpc.sepolia.org)
   ```
   *Note: Never share your `.env` file or private key!*

### Deploy to Testnet (e.g., Sepolia)
Run the following command:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Deploy to Mainnet (e.g., Polygon)
1. Add Polygon RPC to `hardhat.config.js` or `.env`.
2. Run:
```bash
npx hardhat run scripts/deploy.js --network polygon
```

## 3. Post-Deployment
- The script will output the **Contract Address**.
- Update your frontend `contracts/Arcade8004.sol` address configuration.
- The `gameAgent` is initially set to the deployer address. You can change it by calling `setGameAgent(newAddress)` on the contract.

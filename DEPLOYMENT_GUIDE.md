# Deployment Guide for Arcade8004

## 1. Asset Preparation (Completed)
- Images extracted from `Slot Machines.zip`
- Images organized into `public/ready_for_upload/images`
- Metadata generated in `public/ready_for_upload/metadata`
- Images packed into `images.car` (557MB)

## 2. Uploading Assets to Pinata (In Progress)
- Currently uploading `images.car` to Pinata.
- **Action Required**: Wait for the upload script to finish and provide the Image CID.
- Once we have the Image CID (e.g., `QmImageHash`), we will:
  1. Run `python update_metadata_uris.py QmImageHash` to update all metadata files.
  2. Pack metadata into `metadata.car` using `pack_metadata.bat`.
  3. Upload `metadata.car` to Pinata using `node upload_metadata_car.js`.

## 3. Smart Contract Deployment
- **Contract**: `Arcade8004.sol`
- **Network**: (User to choose, e.g., Sepolia, Polygon Amoy)
- **Deployment Command**:
  ```bash
  npx thirdweb deploy
  ```
- **Constructor Arguments**:
  - `_gameAgent`: The address of the wallet that will sign the scores. **IMPORTANT**: Keep the private key of this wallet safe and use it in your backend/API.

## 4. Post-Deployment Configuration
- After deployment, you will get a contract address.
- You must set the Base URI for the metadata.
- **Action**: Call `setBaseURI("ipfs://QmMetadataHash/")` on the contract.
  - `QmMetadataHash` is the CID obtained from step 2.3.
  - Ensure the URI ends with a trailing slash `/`.

## 5. Frontend Integration
- Update `contracts/Arcade8004.sol` address in the frontend config (if hardcoded) or `.env` file.
- Ensure the `gameAgent` address in the contract matches the signer in your backend.

## 6. Verification
- Mint an NFT to verify the flow.
- Check the metadata on OpenSea/Etherscan (it should show the image correctly).

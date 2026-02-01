# Security Audit & Attack Vectors

## 1. On-Chain Vulnerabilities (Smart Contract)

### 1.1 Replay Attacks (Mitigated)
- **Risk:** An attacker could intercept a valid signature for one user/contract and try to reuse it.
- **Mitigation:** The `mint` function now includes `address(this)` in the signed message hash:
  ```solidity
  bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, address(this)));
  ```
  This ensures signatures are bound to this specific contract instance and cannot be used on other deployments (e.g., testnet vs mainnet).

### 1.2 Access Control
- **Risk:** Unauthorized users changing the `gameAgent` or `baseURI`.
- **Mitigation:** Critical functions (`setGameAgent`, `setBaseURI`, `withdraw`) are protected by the `onlyOwner` modifier.

### 1.3 Re-entrancy
- **Risk:** Malicious contracts calling back into `mint` during execution.
- **Mitigation:**
  - State changes (`hasMinted[msg.sender] = true`) happen *before* the external call (`_safeMint`).
  - `_safeMint` is used, which is generally safe, but the Checks-Effects-Interactions pattern is strictly followed.

### 1.4 Randomness/Predictability
- **Risk:** Token IDs are sequential (`_tokenIds++`).
- **Impact:** Low risk for this project as metadata is likely pre-revealed or consistent. If traits were generated on-chain based on block data, this would be a vector.

## 2. Off-Chain Vulnerabilities (Frontend & Game Agent)

### 2.1 Game Score Manipulation (Critical)
- **Risk:** The game logic runs entirely in the client's browser (JavaScript).
- **Attack Vector:** An attacker can easily modify the `score` variable in memory or mock the function calls to the backend to send a fake "high score".
- **Mitigation Strategy (Recommended):**
  - **Server-Side Verification:** The "Game Agent" should not just blindly sign whatever score the frontend sends. It should ideally receive a "replay" of inputs or verify the game state if possible.
  - **Rate Limiting:** Limit the number of signature requests per IP/Wallet.
  - **Obfuscation:** Obfuscate the game code (low security, but deters script kiddies).
  - **Anomaly Detection:** Flag scores that are mathematically impossible (e.g., too high for the time elapsed).

### 2.2 Private Key Management
- **Risk:** The `gameAgent` private key is the "Keys to the Kingdom". If compromised, an attacker can mint infinite NFTs.
- **Mitigation:**
  - **NEVER** store the `gameAgent` private key in the frontend code.
  - Use a secure backend service (e.g., AWS Lambda, localized server) to hold the key and sign messages.
  - **Implemented Solution (Demo):** A local Game Agent server (`scripts/game_agent.js`) has been provided. This script runs locally, reads the private key from `.env`, and exposes a signing endpoint (`http://localhost:3001/sign-mint`). This keeps the key out of the browser bundle.

### 2.3 Metadata Spoofing
- **Risk:** If the IPFS gateway or Pinata account is compromised, metadata could be swapped.
- **Mitigation:** IPFS Content Addressing (CIDs) ensures immutability. The `baseURI` in the contract points to a specific CID folder. Changing the metadata requires an on-chain transaction to `setBaseURI`, which is protected by `onlyOwner`.

## 3. Project-Specific Recommendations

1.  **Backend Implementation:** You strictly need a backend API to generate signatures. The frontend cannot do this securely.
2.  **Signature Expiry:** Consider adding a `timestamp` or `nonce` to the signed message to prevent signatures from being hoarded and used much later (though `hasMinted` prevents double usage).

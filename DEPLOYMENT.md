# Deployment Guide (Vercel)

This project is configured for **One-Click Deployment on Vercel**.
This handles both the **Frontend** (React Game) and the **Backend** (Game Agent/Signer) in a single service.

## 1. Prerequisites
- A GitHub account.
- A [Vercel](https://vercel.com) account (Free Tier is sufficient).
- Your `PRIVATE_KEY` (The same one used in your `.env` file).

## 2. Push to GitHub
1.  Initialize git if you haven't: `git init`
2.  Add files: `git add .`
3.  Commit: `git commit -m "Ready for deployment"`
4.  Push to your GitHub repository.

## 3. Deploy to Vercel
1.  Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  **Configure Project:**
    - **Framework Preset:** Vite (Should be detected automatically).
    - **Root Directory:** `./` (Default).
5.  **Environment Variables (CRITICAL):**
    - Expand the "Environment Variables" section.
    - Add Key: `PRIVATE_KEY`
    - Add Value: `YOUR_PRIVATE_KEY_HERE` (Paste your wallet private key).
    - *Note:* Do not add `RPC_URL` unless you are using it in the serverless function (currently not needed, but good to have if you expand logic).
6.  Click **"Deploy"**.

## 4. Verification
1.  Once deployed, Vercel will give you a domain (e.g., `https://8004-arcade.vercel.app`).
2.  Visit the URL.
3.  Play the game until you reach score 300.
4.  Click "Mint".
5.  The app will call `/api/sign-mint`.
6.  If your `PRIVATE_KEY` is correct, the transaction will pop up in MetaMask.

## 5. Using a Custom Domain (DNS Configuration)
To use your own domain (e.g., `8004arcade.com` or `www.8004arcade.com`), follow these specific DNS steps:

1.  **Vercel Settings:**
    - Go to your Project > **Settings** > **Domains**.
    - Add your domain (e.g., `8004arcade.com`).
    - Vercel will recommend adding `www.8004arcade.com` as well. Add both.

2.  **Configure DNS (at your Registrar):**
    Log in to where you bought your domain (GoDaddy, Namecheap, etc.) and find the **DNS Management** or **DNS Records** section.

    **Step A: The CNAME Record (For "www")**
    This connects `www.8004arcade.com` to Vercel.
    - **Type:** `CNAME`
    - **Name / Host:** `www`
    - **Value / Target:** `cname.vercel-dns.com`
    - **TTL:** `Default` or `1 Hour`

    **Step B: The A Record (For root domain)**
    This connects `8004arcade.com` (without www) to Vercel.
    - **Type:** `A`
    - **Name / Host:** `@` (or leave blank if your provider requires it)
    - **Value / Target:** `76.76.21.21` (Vercel's IP)
    - **TTL:** `Default` or `1 Hour`

3.  **Wait for Propagation:**
    - DNS changes can take a few minutes to 24 hours (usually fast).
    - In Vercel, the "Invalid Configuration" error will turn into a green checkmark once the records are found.

Your game code is already compatible with any domain!

## 6. Fund Management (Withdrawal)
Since this is a paid mint, the contract will accumulate ETH. To withdraw funds:

1.  Ensure your `.env` file has the correct `PRIVATE_KEY` (must be the deployer/owner wallet).
2.  Run the withdrawal script:
    ```bash
    npx hardhat run scripts/withdraw.js --network sepolia
    ```
    *(Replace `sepolia` with `mainnet` or `base` when you launch on mainnet)*
3.  The script will check the balance and transfer all funds to the deployer's wallet.

## Local Development
To run everything locally with the new setup:

**Option A (Vercel CLI - Recommended):**
1.  Install Vercel CLI: `npm i -g vercel`
2.  Run: `vercel dev`
    - This emulates the production environment locally.

**Option B (Legacy Way):**
1.  Run the game agent: `node scripts/game_agent.js` (Note: You'll need to update `web3Service.ts` to point to `http://localhost:3001` temporarily or configure proxy to port 3001).

**Current Configuration:**
- The frontend calls `/api/sign-mint`.
- `vite.config.ts` is configured to proxy `/api` requests to `http://localhost:3000` (Vercel default) or you can adjust it to `3001` if running the node script.

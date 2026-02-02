import { ethers } from 'ethers';

// Contract Configuration
const CONTRACT_ADDRESS = "0x2AE8969DDDAf15e268792B4c361c45E20993ceC0";
const CONTRACT_ABI = [
  "function mint(uint256 amount, bytes calldata signature) external payable",
  "function mintCounts(address wallet) external view returns (uint256)",
  "function mintPrice() external view returns (uint256)",
  "function FREE_MINT_LIMIT() external view returns (uint256)",
  "function MAX_SUPPLY() external view returns (uint256)",
  "function MAX_PER_WALLET() external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function gameAgent() external view returns (address)",
  "event NFTMinted(address indexed player, uint256 tokenId)"
];

const CHAIN_ID = '0x1'; // Ethereum Mainnet

// Helper to get the browser provider
const getProvider = () => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  return null;
};

const switchNetwork = async () => {
  const provider = getProvider();
  if (!provider) return;
  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: CHAIN_ID }]);
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (error.code === 4902) {
      await provider.send("wallet_addEthereumChain", [{
        chainId: CHAIN_ID,
        chainName: 'Ethereum Mainnet',
        rpcUrls: ['https://eth.llamarpc.com'], // Public RPC
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        },
        blockExplorerUrls: ['https://etherscan.io']
      }]);
    } else {
      console.error("Failed to switch network:", error);
      throw error;
    }
  }
};

export const connectWallet = async (): Promise<string | null> => {
  const provider = getProvider();
  if (!provider) {
    console.error("Metamask not found");
    return null;
  }

  try {
    await switchNetwork();
    const accounts = await provider.send("eth_requestAccounts", []);
    return accounts[0];
  } catch (error) {
    console.error("Error connecting wallet:", error);
    return null;
  }
};

export const checkCanMint = async (walletAddress: string): Promise<boolean> => {
  const provider = getProvider();
  if (!provider) return false;

  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const mintCount = await contract.mintCounts(walletAddress);
    const maxPerWallet = await contract.MAX_PER_WALLET();
    return mintCount < maxPerWallet;
  } catch (error) {
    console.error("Error checking mint status:", error);
    return false;
  }
};

export const mintNFT = async (score: number, walletAddress: string, game: string, amount: number = 1): Promise<{ success: boolean; error?: string }> => {
  const provider = getProvider();
  if (!provider) return { success: false, error: "No wallet provider found" };

  try {
    await switchNetwork();
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    
    // Verify wallet address consistency
    if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return { success: false, error: "Wallet mismatch. Please reconnect." };
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // 1. Request Signature from Game Agent (Backend)
    // In production (Vercel), this hits /api/sign-mint (Serverless Function)
    // Locally, Vite proxies /api to the backend or we can run the backend separately
    let signature;
    try {
      // Use relative path so it works both on localhost (via proxy) and production (same domain)
      const response = await fetch('/api/sign-mint', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          wallet: walletAddress, 
          score: Number(score), // Ensure primitive number
          game: String(game),   // Ensure primitive string
          amount: Number(amount) // Ensure primitive number
        }) 
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to get signature from Game Agent");
      }

      const data = await response.json();
      signature = data.signature;
      
      console.log("Received signature from backend:", signature);

    } catch (err: any) {
      console.warn("Backend signature request failed:", err);
      return { success: false, error: `Signature failed: ${err.message}` };
    }

    // 2. Mint with Signature
    
    // Fetch current state to determine price
    const mintPrice = await contract.mintPrice();
    const totalSupply = await contract.totalSupply();
    const freeLimit = await contract.FREE_MINT_LIMIT();
    const currentMints = await contract.mintCounts(walletAddress);
    
    let valueToSend = 0n;
    
    // Calculate total cost loop matching contract logic
    for (let i = 0; i < amount; i++) {
         // Contract logic: bool isFree = (_tokenIds + i + 1 <= FREE_MINT_LIMIT) && (mintCounts[msg.sender] + i == 0);
         // We approximate _tokenIds with totalSupply (might be slightly off if concurrent mints, but safe for estimation)
         // Note: BigInt arithmetic
         const isFree = (BigInt(totalSupply) + BigInt(i) + 1n <= BigInt(freeLimit)) && (BigInt(currentMints) + BigInt(i) === 0n);
         
         if (!isFree) {
             valueToSend += BigInt(mintPrice);
         }
    }

    const tx = await contract.mint(amount, signature, {
      value: valueToSend
    });

    console.log("Mint transaction sent:", tx.hash);
    await tx.wait();
    
    return { success: true };

  } catch (error: any) {
    console.error("Minting error:", error);
    
    let errorMessage = "Minting failed. Please try again.";

    // 1. User Rejected
    if (error.code === 'ACTION_REJECTED' || error.code === 4001 || error.message?.includes('user rejected')) {
        errorMessage = "Transaction cancelled.";
    } 
    // 2. Already Minted (Contract Revert)
    else if (
        error.message?.includes('Wallet has already minted') || 
        error.reason?.includes('Wallet has already minted') ||
        error.data?.message?.includes('Wallet has already minted')
    ) {
        errorMessage = "You have already minted an NFT! Limit one per wallet.";
    }
    // 3. Insufficient Funds (Gas or Value)
    else if (error.code === 'INSUFFICIENT_FUNDS' || error.message?.includes('insufficient funds')) {
        errorMessage = "Insufficient funds for minting (0.0003 ETH + Gas).";
    }
    // 4. Contract Logic Reverts
    else if (error.reason) {
        if (error.reason.includes("Wallet limit reached")) {
            errorMessage = "Wallet limit reached (3 max).";
        } else if (error.reason.includes("Max supply reached")) {
            errorMessage = "Max supply reached.";
        } else if (error.reason.includes("Insufficient ETH sent")) {
            errorMessage = "Insufficient ETH sent for paid mint.";
        } else if (error.reason.includes("Invalid signature")) {
            errorMessage = "Invalid signature rejected by contract.";
        } else {
            errorMessage = `Contract Error: ${error.reason}`;
        }
    } else if (error.message) {
         errorMessage = `Error: ${error.message}`;
    }

    return { success: false, error: errorMessage };
  }
};

export const getTotalMinted = async (): Promise<string> => {
  const provider = getProvider();
  // If no wallet connected, we can try to use a default RPC if available, 
  // but for now we'll rely on the browser provider or return "0"
  if (!provider) return "0";

  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const supply = await contract.totalSupply();
    return supply.toString();
  } catch (error) {
    console.error("Error getting total supply:", error);
    return "0";
  }
};

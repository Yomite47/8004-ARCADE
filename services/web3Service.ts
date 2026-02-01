import { ethers } from 'ethers';

// Contract Configuration
const CONTRACT_ADDRESS = "0xec21C17F1CD883aC5CDc449620e4399EaDee33F3";
const CONTRACT_ABI = [
  "function mint(bytes calldata signature) external payable",
  "function canMint(address wallet) external view returns (bool)",
  "function hasMinted(address wallet) external view returns (bool)",
  "function MINT_PRICE() external view returns (uint256)",
  "event NFTMinted(address indexed player, uint256 tokenId)"
];

const SEPOLIA_CHAIN_ID = '0xaa36a7';

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
    await provider.send("wallet_switchEthereumChain", [{ chainId: SEPOLIA_CHAIN_ID }]);
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (error.code === 4902) {
      await provider.send("wallet_addEthereumChain", [{
        chainId: SEPOLIA_CHAIN_ID,
        chainName: 'Sepolia',
        rpcUrls: ['https://rpc.sepolia.org'],
        nativeCurrency: {
            name: 'Sepolia Ether',
            symbol: 'ETH',
            decimals: 18
        },
        blockExplorerUrls: ['https://sepolia.etherscan.io']
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
    // The contract has a 'canMint' helper, or we can check '!hasMinted'
    const alreadyMinted = await contract.hasMinted(walletAddress);
    return !alreadyMinted;
  } catch (error) {
    console.error("Error checking mint status:", error);
    return false;
  }
};

export const mintNFT = async (score: number, walletAddress: string): Promise<{ success: boolean; error?: string }> => {
  const provider = getProvider();
  if (!provider) return { success: false, error: "No wallet provider found" };

  try {
    await switchNetwork();
    const signer = await provider.getSigner();
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
        body: JSON.stringify({ wallet: walletAddress, score }) 
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to get signature from Game Agent");
      }

      const data = await response.json();
      signature = data.signature;
    } catch (err) {
      console.warn("Backend signature request failed:", err);
      return { success: false, error: "Signature failed. Ensure backend is running." };
    }

    // 2. Mint with Signature
    const mintPrice = await contract.MINT_PRICE();
    
    const tx = await contract.mint(signature, {
      value: mintPrice
    });

    console.log("Mint transaction sent:", tx.hash);
    await tx.wait();
    
    return { success: true };

  } catch (error: any) {
    console.error("Minting error:", error);
    return { success: false, error: error.message || "Minting failed" };
  }
};

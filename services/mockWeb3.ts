// This service mocks the behavior of Thirdweb SDK for the purpose of this runnable demo.
// In a production environment, you would replace these delays with actual contract calls.

export const connectWallet = async (): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return a mock ETH address
      resolve("0x71C...9A23");
    }, 1200);
  });
};

export const mintNFT = async (score: number): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate minting success
      console.log(`Minting NFT for score: ${score}`);
      resolve(true);
    }, 2000);
  });
};
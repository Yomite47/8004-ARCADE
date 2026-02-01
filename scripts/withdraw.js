const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const contractAddress = "0xec21C17F1CD883aC5CDc449620e4399EaDee33F3";

    console.log("Withdrawing funds with account:", deployer.address);

    const Arcade = await ethers.getContractFactory("Arcade8004");
    const arcade = Arcade.attach(contractAddress);

    // Check balance
    const provider = ethers.provider;
    const balance = await provider.getBalance(contractAddress);
    console.log(`Contract balance: ${ethers.formatEther(balance)} ETH`);

    if (balance === 0n) {
        console.log("No funds to withdraw.");
        return;
    }

    console.log("Withdrawing...");
    const tx = await arcade.withdraw();
    await tx.wait();

    console.log("Withdrawal successful!");
    
    const newBalance = await provider.getBalance(contractAddress);
    console.log(`New Contract balance: ${ethers.formatEther(newBalance)} ETH`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

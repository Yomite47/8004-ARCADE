const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Arcade8004 Withdrawal", function () {
  let Arcade8004;
  let arcade;
  let owner;
  let addr1;
  let gameAgent;
  const MINT_PRICE = ethers.parseEther("0.002");

  beforeEach(async function () {
    [owner, addr1, gameAgent] = await ethers.getSigners();
    Arcade8004 = await ethers.getContractFactory("Arcade8004");
    arcade = await Arcade8004.deploy(gameAgent.address);
    await arcade.waitForDeployment();
  });

  it("Should allow owner to withdraw funds", async function () {
    // 1. Send some funds to the contract (simulate a mint)
    // We can just send ETH directly if the contract has receive(), but Arcade8004 likely doesn't.
    // So we use the mint function.
    
    // Create a valid signature for minting
    const contractAddress = await arcade.getAddress();
    const messageHash = ethers.solidityPackedKeccak256(
        ["address", "address"],
        [addr1.address, contractAddress]
    );
    const signature = await gameAgent.signMessage(ethers.getBytes(messageHash));

    // Mint from addr1
    await arcade.connect(addr1).mint(signature, { value: MINT_PRICE });

    // Check contract balance
    const balanceBefore = await ethers.provider.getBalance(contractAddress);
    expect(balanceBefore).to.equal(MINT_PRICE);

    // 2. Withdraw
    const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
    
    const tx = await arcade.connect(owner).withdraw();
    const receipt = await tx.wait();
    
    // Calculate gas cost
    const gasUsed = receipt.gasUsed * receipt.gasPrice;

    // Check balances
    const balanceAfter = await ethers.provider.getBalance(contractAddress);
    const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

    expect(balanceAfter).to.equal(0n);
    expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + MINT_PRICE - gasUsed);
  });

  it("Should fail if non-owner tries to withdraw", async function () {
    await expect(arcade.connect(addr1).withdraw()).to.be.revertedWithCustomError(arcade, "OwnableUnauthorizedAccount");
  });
});
